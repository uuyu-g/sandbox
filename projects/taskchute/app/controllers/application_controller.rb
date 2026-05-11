class ApplicationController < ActionController::Base
  allow_browser versions: :modern

  inertia_share flash: -> { { notice: flash.notice, alert: flash.alert } }
end
