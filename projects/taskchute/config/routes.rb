Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  root "tasks#index"

  resources :tasks, only: [ :index, :create, :update, :destroy ] do
    member do
      post :start
      post :finish
      post :reset
    end
    collection do
      patch :reorder
    end
  end

  resources :routines, only: [ :index, :create, :update, :destroy ] do
    collection do
      post :expand
    end
  end
end
