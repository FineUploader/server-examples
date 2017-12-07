Rails.application.routes.draw do
  root 'photos#index'

  post 'uploads', to: 'photos#upload'
  post 'uploads_finish', to: 'photos#finish'
  delete 'delete_uploads', to: 'photos#destroy'
end
