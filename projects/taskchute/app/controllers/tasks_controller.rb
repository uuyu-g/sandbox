class TasksController < ApplicationController
  before_action :set_task, only: [ :update, :destroy, :start, :finish, :reset ]

  def index
    date = parse_date(params[:date]) || Date.current
    tasks = Task.for_date(date).ordered.to_a

    render inertia: "Today", props: {
      date: date.iso8601,
      tasks: tasks.map(&:as_json_payload),
      sections: Task::SECTIONS,
      summary: build_summary(tasks),
    }
  end

  def create
    task = Task.new(task_params)
    task.scheduled_on ||= Date.current
    task.position ||= next_position_for(task.scheduled_on, task.section)
    if task.save
      redirect_to tasks_path(date: task.scheduled_on.iso8601), status: :see_other
    else
      redirect_to tasks_path, inertia: { errors: task.errors }, status: :see_other
    end
  end

  def update
    if @task.update(task_params)
      redirect_to tasks_path(date: @task.scheduled_on.iso8601), status: :see_other
    else
      redirect_to tasks_path(date: @task.scheduled_on.iso8601), inertia: { errors: @task.errors }, status: :see_other
    end
  end

  def destroy
    date = @task.scheduled_on
    @task.destroy
    redirect_to tasks_path(date: date.iso8601), status: :see_other
  end

  def start
    @task.update!(started_at: Time.current, finished_at: nil, done: false)
    redirect_to tasks_path(date: @task.scheduled_on.iso8601), status: :see_other
  end

  def start_now
    now = Time.current
    today = now.to_date
    section = Task.section_for_time(now)

    Task.transaction do
      Task.for_date(today).where.not(started_at: nil).where(finished_at: nil).find_each do |t|
        t.update!(finished_at: now, done: true)
      end

      title = params.dig(:task, :title).to_s.strip
      title = "無題のタスク" if title.blank?

      task = Task.new(
        title: title,
        section: section,
        scheduled_on: today,
        estimate_minutes: 0,
        started_at: now,
      )
      task.position = next_position_for(today, section)
      task.save!
    end

    redirect_to tasks_path(date: today.iso8601)
  end

  def finish
    @task.started_at ||= Time.current
    @task.finished_at = Time.current
    @task.done = true
    @task.save!
    redirect_to tasks_path(date: @task.scheduled_on.iso8601), status: :see_other
  end

  def reset
    @task.update!(started_at: nil, finished_at: nil, done: false)
    redirect_to tasks_path(date: @task.scheduled_on.iso8601), status: :see_other
  end

  def reorder
    date = parse_date(params[:date]) || Date.current
    Array(params[:items]).each do |item|
      task = Task.find_by(id: item[:id])
      next unless task
      task.update!(section: item[:section], position: item[:position])
    end
    redirect_to tasks_path(date: date.iso8601), status: :see_other
  end

  private

  def set_task
    @task = Task.find(params[:id])
  end

  def task_params
    params.require(:task).permit(:title, :section, :estimate_minutes, :scheduled_on, :note, :position, :done)
  end

  def parse_date(str)
    return nil if str.blank?
    Date.iso8601(str.to_s)
  rescue ArgumentError
    nil
  end

  def next_position_for(date, section)
    (Task.for_date(date).where(section: section).maximum(:position) || -1) + 1
  end

  def build_summary(tasks)
    totals = { estimate: 0, actual: 0, done_count: 0, total_count: tasks.size }
    tasks.each do |t|
      totals[:estimate] += t.estimate_minutes.to_i
      totals[:actual] += t.actual_minutes.to_i if t.actual_minutes
      totals[:done_count] += 1 if t.done
    end
    totals
  end
end
