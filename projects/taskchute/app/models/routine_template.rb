class RoutineTemplate < ApplicationRecord
  SECTIONS = Task::SECTIONS
  ALL_WEEKDAYS_MASK = 0b1111111 # 127, all days

  has_many :tasks, dependent: :nullify

  validates :title, presence: true
  validates :section, inclusion: { in: SECTIONS }
  validates :estimate_minutes, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :weekdays_mask, numericality: { only_integer: true, greater_than_or_equal_to: 0, less_than_or_equal_to: ALL_WEEKDAYS_MASK }

  scope :active, -> { where(active: true) }
  scope :ordered, -> { order(:section, :position, :id) }

  # weekday: 0=Sunday .. 6=Saturday
  def applies_to_weekday?(weekday)
    weekdays_mask & (1 << weekday) != 0
  end

  def weekdays
    (0..6).select { |w| applies_to_weekday?(w) }
  end

  def self.mask_from_weekdays(weekdays)
    Array(weekdays).map(&:to_i).inject(0) { |m, w| m | (1 << w) }
  end

  def as_json_payload
    {
      id: id,
      title: title,
      section: section,
      estimate_minutes: estimate_minutes,
      position: position,
      weekdays: weekdays,
      weekdays_mask: weekdays_mask,
      active: active,
      note: note,
    }
  end
end
