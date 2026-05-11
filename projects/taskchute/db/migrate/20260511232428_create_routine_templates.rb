class CreateRoutineTemplates < ActiveRecord::Migration[8.1]
  def change
    create_table :routine_templates do |t|
      t.string :title, null: false
      t.string :section, null: false, default: "morning"
      t.integer :estimate_minutes, null: false, default: 0
      t.integer :position, null: false, default: 0
      t.integer :weekdays_mask, null: false, default: 127
      t.boolean :active, null: false, default: true
      t.text :note

      t.timestamps
    end
  end
end
