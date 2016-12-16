class PhotosController < ApplicationController
  before_action :set_photo, only: [:show, :edit, :update]

  # GET /photos
  # GET /photos.json
  def index
    @photos = Photo.all
    @brand_name = 'PhotosApp'
  end

  # GET /photos/1
  # GET /photos/1.json
  def show
  end

  # GET /photos/new
  def new
    @photo = Photo.new
  end

  # GET /photos/1/edit
  def edit
  end

  # POST /photos
  # POST /photos.json
  def create
    @photo = Photo.new(photo_params)

    respond_to do |format|
      if @photo.save
        format.html { redirect_to @photo, notice: 'Photo was successfully created.' }
        format.json { render :show, status: :created, location: @photo }
      else
        format.html { render :new }
        format.json { render json: @photo.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /photos/1
  # PATCH/PUT /photos/1.json
  def update
    respond_to do |format|
      if @photo.update(photo_params)
        format.html { redirect_to @photo, notice: 'Photo was successfully updated.' }
        format.json { render :show, status: :ok, location: @photo }
      else
        format.html { render :edit }
        format.json { render json: @photo.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /photos/1
  # DELETE /photos/1.json
  def destroy
    photo = Photo.find_by(qquuid: params[:qquuid])
    if photo.destroy
       respond_to do |format|
          format.json {
             render json: { success: true }
          }
       end
     end
  end

  def upload
    photo = Photo.new
    photo.name = params[:qqfilename]
    photo.qquuid = params[:qquuid]
    photo.attachment = params[:qqfile]

    if photo.save
       respond_to do |format|
          format.json {
             render json: { success: true }
          }
       end
     else
       respond_to do |format|
         format.json {
           render json: { errors: 'Something went wrong'}
         }
       end
     end
  end

  def finish
    # Grab all parts of photo
    photos = Photo.where(qquuid: params[:qquuid]).all
    # Combine all parts
    @photo = Photo.combine_photos(photos)

    if @photo.save
       respond_to do |format|
          format.json {
             render json: { success: true }
          }
       end
     end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_photo
      @photo = Photo.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def photo_params
      params.require(:photo).permit(:name, :attachment, :qquuid)
    end
end
