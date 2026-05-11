class RoutinesController < ApplicationController
  before_action :set_routine, only: [ :update, :destroy ]

  def index
    routines = RoutineTemplate.ordered.to_a
    render inertia: "Routines", props: {
      routines: routines.map(&:as_json_payload),
      sections: RoutineTemplate::SECTIONS,
    }
  end

  def create
    attrs = routine_params
    attrs[:weekdays_mask] = build_weekdays_mask(params[:routine_template])
    attrs[:position] ||= next_position_for(attrs[:section])
    routine = RoutineTemplate.new(attrs)
    if routine.save
      redirect_to routines_path
    else
      redirect_to routines_path, inertia: { errors: routine.errors }
    end
  end

  def update
    attrs = routine_params
    if params[:routine_template]&.key?(:weekdays)
      attrs[:weekdays_mask] = build_weekdays_mask(params[:routine_template])
    end
    if @routine.update(attrs)
      redirect_to routines_path
    else
      redirect_to routines_path, inertia: { errors: @routine.errors }
    end
  end

  def destroy
    @routine.destroy
    redirect_to routines_path
  end

  # Expands routines for a given date (default today) into Task rows.
  def expand
    date = parse_date(params[:date]) || Date.current
    created = 0
    weekday = date.wday
    section_positions = {}
    RoutineTemplate::SECTIONS.each do |s|
      section_positions[s] = (Task.for_date(date).where(section: s).maximum(:position) || -1)
    end

    RoutineTemplate.active.ordered.each do |routine|
      next unless routine.applies_to_weekday?(weekday)
      already = Task.for_date(date).where(routine_template_id: routine.id).exists?
      next if already
      section_positions[routine.section] += 1
      Task.create!(
        title: routine.title,
        section: routine.section,
        estimate_minutes: routine.estimate_minutes,
        position: section_positions[routine.section],
        scheduled_on: date,
        note: routine.note,
        routine_template_id: routine.id,
        done: false,
      )
      created += 1
    end

    redirect_to tasks_path(date: date.iso8601), notice: "ルーチンを #{created} 件展開しました"
  end

  private

  def set_routine
    @routine = RoutineTemplate.find(params[:id])
  end

  def routine_params
    params.require(:routine_template).permit(:title, :section, :estimate_minutes, :position, :active, :note)
  end

  def build_weekdays_mask(payload)
    weekdays = Array(payload && payload[:weekdays]).map(&:to_i)
    weekdays = (0..6).to_a if weekdays.empty?
    RoutineTemplate.mask_from_weekdays(weekdays)
  end

  def next_position_for(section)
    (RoutineTemplate.where(section: section).maximum(:position) || -1) + 1
  end

  def parse_date(str)
    return nil if str.blank?
    Date.iso8601(str.to_s)
  rescue ArgumentError
    nil
  end
end
