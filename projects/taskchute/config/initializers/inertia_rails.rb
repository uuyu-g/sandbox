InertiaRails.configure do |config|
  config.version = ENV.fetch("ASSETS_VERSION", "1")
end
