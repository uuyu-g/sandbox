# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_05_11_232428) do
  create_table "routine_templates", force: :cascade do |t|
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.integer "estimate_minutes", default: 0, null: false
    t.text "note"
    t.integer "position", default: 0, null: false
    t.string "section", default: "morning", null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.integer "weekdays_mask", default: 127, null: false
  end

  create_table "tasks", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.boolean "done", default: false, null: false
    t.integer "estimate_minutes", default: 0, null: false
    t.datetime "finished_at"
    t.text "note"
    t.integer "position", default: 0, null: false
    t.integer "routine_template_id"
    t.date "scheduled_on", null: false
    t.string "section", default: "morning", null: false
    t.datetime "started_at"
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["routine_template_id"], name: "index_tasks_on_routine_template_id"
    t.index ["scheduled_on", "section", "position"], name: "index_tasks_on_scheduled_on_and_section_and_position"
  end

  add_foreign_key "tasks", "routine_templates"
end
