class Task < ApplicationRecord
  SECTIONS = %w[morning noon night].freeze

  belongs_to :routine_template, optional: true

  validates :section, inclusion: { in: SECTIONS }
  validates :estimate_minutes, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :scheduled_on, presence: true

  scope :for_date, ->(date) { where(scheduled_on: date) }
  scope :ordered, -> { order(:section, :position, :id) }

  def actual_minutes
    return nil unless started_at && finished_at
    ((finished_at - started_at) / 60.0).round
  end

  def in_progress?
    started_at.present? && finished_at.blank?
  end

  def as_json_payload
    {
      id: id,
      title: title,
      section: section,
      estimate_minutes: estimate_minutes,
      position: position,
      scheduled_on: scheduled_on.iso8601,
      started_at: started_at&.iso8601,
      finished_at: finished_at&.iso8601,
      actual_minutes: actual_minutes,
      done: done,
      in_progress: in_progress?,
      note: note,
      routine_template_id: routine_template_id,
    }
  end
end
