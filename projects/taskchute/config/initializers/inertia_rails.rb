InertiaRails.configure do |config|
  config.version = ENV.fetch("ASSETS_VERSION", "1")

  # @inertiajs/core >= 2.x reads the initial page from a <script type="application/json">
  # element instead of a <div data-page="...">. Enable that emission mode here.
  config.use_script_element_for_initial_page = true

  # Opt in to the Inertia 4.0 protocol behavior of always including an empty
  # errors hash, silencing the deprecation warning.
  config.always_include_errors_hash = true
end
