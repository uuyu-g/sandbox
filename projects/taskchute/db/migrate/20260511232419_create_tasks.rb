class CreateTasks < ActiveRecord::Migration[8.1]
  def change
    create_table :tasks do |t|
      t.string :title, null: false
      t.string :section, null: false, default: "morning"
      t.integer :estimate_minutes, null: false, default: 0
      t.integer :position, null: false, default: 0
      t.date :scheduled_on, null: false
      t.datetime :started_at
      t.datetime :finished_at
      t.boolean :done, null: false, default: false
      t.text :note
      t.references :routine_template, foreign_key: true, null: true

      t.timestamps
    end

    add_index :tasks, [ :scheduled_on, :section, :position ]
  end
end
