
/**
 * Functionality for the united upload form type.
 */
UnitedOne.modules.UnitedOneUpload = {

    /**
     * All uploadHandlers must be registered here.
     */
    uploadHandler: {},

    /**
     * Initialize jquery file upload.
     *
     * @param $widget
     * @param $input
     * @param $progress
     * @param handler
     */
    initFileUpload: function($widget, $input, $progress, handler){

        var t = this;
        var options = $.extend({
            dropZone: $widget,
            progressall: function(e, data) {
                t.onProgress($progress, e, data);
            },
            add: function(e, data) {
                data = handler.onAdd(data);
                t.onAdd($widget, $progress, e, data);
            },
            done: function(e, data) {
                data = handler.onDone(data);
                t.onDone($widget, $progress, e, data);
            },
            fail: function(e, data) {
                data = handler.onFail(data);
                t.onFail($widget, $progress, e, data);
            }
        }, handler.uploadOptions());

        $input.fileupload(options);
    },

    /**
     * CB: Update the progress bar.
     *
     * @param $progress
     * @param e
     * @param data
     */
    onProgress: function($progress, e, data) {
        var progress = parseInt(data.loaded / data.total * 100, 10);
        $progress.progress({percent: progress});
    },

    /**
     * CB: After adding a file, show the loading animation.
     *
     * @param $widget
     * @param $progress
     * @param e
     * @param data
     */
    onAdd: function($widget, $progress, e, data) {

        $widget.removeClass('teal');
        $widget.addClass('loading');
        $progress.progress({percent: 0});
        $progress.fadeIn();
        data.submit();
    },

    /**
     * CB: After file was uploaded, hide loading animation.
     *
     * @param $widget
     * @param $progress
     */
    onDone: function($widget, $progress) {

        $progress.fadeOut();
        $widget.removeClass('loading');
    },

    /**
     * CB: After file upload failed, hide loading animation.
     * @param $widget
     * @param $progress
     */
    onFail: function($widget, $progress) {
        $progress.fadeOut();
        $widget.removeClass('loading');
    },

    /**
     * Register file upload for all DOM fields.
     */
    ready: function (context) {

        var t = this;

        $('.united-one-upload-widget', context).each(function () {

            // get the upload handler
            var handler_name = $(this).data('upload-handler');
            if(!(handler_name in t.uploadHandler)) {
                $(this).hide();
                alert('ERROR: Upload handler "' + handler_name + '" was not found.');
                return false;
            }

            var handler = t.uploadHandler[handler_name]();

            var $select_widget = $('.select-widget', $(this));
            var $preview_widget = $('.preview-widget', $(this));
            var $progress = $('.progress', $(this));
            var $input = $('input[type="file"]', $(this));
            var $input_path = $('input[type="hidden"][name$="[path]"]', $(this));
            var $input_data = $('input[type="hidden"][name$="[data]"]', $(this));

            $progress.hide();

            handler.upload_url = $(this).data('upload-url');

            handler.$inputs = {
                path: $input_path,
                data: $input_data
            };

            handler.$widgets = {
                main: $(this),
                select: $select_widget,
                preview: $preview_widget
            };

            handler.init();

            if($input_path.val().length > 0) {
                handler.onInitData($input_path.val(), $input_data.val());
            }

            t.initFileUpload($(this), $input, $progress, handler);

            $(this).bind('dragover', function(){
                $(this).addClass('teal');
            });

            $(this).bind('dragleave', function() {
                $(this).removeClass('teal');
            });
        });
    },

    /**
     * Defines the basic handler, all other handlers should extend from.
     */
    baseHandler: {

        /**
         * Holds the upload url if any was passed to the field.
         */
        upload_url: null,

        /**
         * This method gets called after all data was passed to the handler.
         */
        init: function () {},

        /**
         * Returns the upload options for jquery file upload.
         * @returns hash
         */
        uploadOptions: function () {
            return {
                url: this.upload_url
            };
        },

        /**
         * Renders a file preview.
         *
         * @param filename
         */
        renderFilePreview: function (filename) {
            var t = this;

            var $grid = $('<div />', {class: 'ui grid'});
            var $left = $('<div />', {class: 'ten wide column'});
            var $right = $('<div />', {class: 'six wide right aligned column'});
            var $button = $('<button />', {class: 'ui mini circular negative icon button'});

            $button.append($('<i />', {class: 'icon delete'}));
            $left.append($('<div />', {class: 'ui tiny header', text: filename}));
            $right.append($button);

            $grid.append($left).append($right);
            t.$widgets.preview.hide();
            t.$widgets.preview.html('');
            t.$widgets.preview.append($grid);

            $button.click(function () {
                t.onDelete();
                return false;
            });
        },

        /**
         * Renders an image preview.
         *
         * @param imageurl
         */
        renderImagePreview: function (imageurl) {
            var t = this;
            var $grid = $('<div />', {class: 'ui grid'});
            var $left = $('<div />', {class: 'thirteen wide column'});
            var $right = $('<div />', {class: 'three wide right aligned column'});
            var $button = $('<button />', {class: 'ui small circular negative icon button'});

            $button.append($('<i />', {class: 'icon delete'}));
            $left.append($('<img />', {src: imageurl, style: 'max-width: 100%; height: auto;'}));
            $right.append($button);

            $grid.append($left).append($right);
            t.$widgets.preview.hide();
            t.$widgets.preview.html('');
            t.$widgets.preview.append($grid);

            $button.click(function () {
                t.onDelete();
                return false;
            });
        },

        isPathImage: function(path) {
            var parts = path.split('.');
            var last = parts[parts.length - 1];
            var image_types = ['png', 'jpg', 'jpeg', 'gif'];
            return (image_types.indexOf(last) >=0);
        },

        /**
         * This method decides if an image or an generic file should be rendered. And calls the correspondending method.
         * @param path
         */
        renderPreview: function(path) {
            if(this.isPathImage(path)) {
                this.renderImagePreview(path);
            } else {
                this.renderFilePreview(path);
            }
        },

        /**
         * This method decides if an image or an generic file should be rendered. And calls the correspondending method.
         * @param file
         */
        renderPreviewFromDOMFile: function(file) {
            if(this.isPathImage(file.name)) {
                this.renderImagePreview(window.URL.createObjectURL(file));
            } else {
                this.renderFilePreview(file.name);
            }
        },

        /**
         * Callback, gets called when there is already data in this field.
         *
         * @param path
         * @param data
         */
        onInitData: function (path, data) {
            this.renderPreview(path);
            this.$widgets.preview.fadeIn();
            this.$widgets.select.hide();
        },

        /**
         * Callback, gets called when a new file was dropped or selected.
         *
         * @param data
         */
        onAdd: function (data) {
            this.renderPreviewFromDOMFile(data.files[0]);
            return data;
        },

        /**
         * Callback, gets called when a file was uploaded successfully.
         * @param data
         */
        onDone: function (data) {
            var t = this;
            t.saveData(data, function(){
                t.$widgets.preview.fadeIn();
                t.$widgets.select.hide();
            });
            return data;
        },

        /**
         * Save the ajax result data to the hidden DOM input fields.
         * @param data
         * @param callback
         */
        saveData: function(path, callback) {
            this.$inputs.path.val(data.path);
            this.$inputs.data.val(data);
            if(callback != undefined) {
                callback();
            }
        },

        /**
         * Callback, gets called when a file upload failed.
         */
        onFail: function (data) {
            setTimeout(function () {
                alert("Error, uploading file. Please try again later.");
            }, 500);
            return data;
        },

        /**
         * Internal method, gets called when the delete button was clicked.
         */
        onDelete: function () {
            var t = this;
            t.$widgets.main.addClass('loading');
            t.deleteData(function(){
                t.$widgets.preview.hide();
                t.$widgets.select.fadeIn();
                t.$widgets.main.removeClass('loading');
            });
        },

        deleteData: function(callback) {
            this.$inputs.path.val('');
            this.$inputs.data.val('');
            if(callback != undefined) {
                callback();
            }
        }
    }
};

/**
 * Default generic fle upload handler.
 *
 * @returns handler hash
 */
UnitedOne.modules.UnitedOneUpload.uploadHandler.united_file = function(){
    return $.extend(UnitedOne.modules.UnitedOneUpload.baseHandler, {});
};


/**
 * Cloudinary file upload handler.
 *
 * @returns handler hash
 */
UnitedOne.modules.UnitedOneUpload.uploadHandler.united_cloudinary_file = function(){

    return $.extend({}, $.extend(UnitedOne.modules.UnitedOneUpload.baseHandler, {

        /**
         * Holds all cloudinary options & data, including signature and public_id if file data is present.
         */
        cloudinary          : {},

        /**
         * Holds the delete_token, after a file was uploaded.
         */
        delete_token        : null,

        /**
         * On init we pass the cloudinary data and base url.
         */
        init: function () {
            this.cloudinary = this.$widgets.main.data('cloudinary-data');
        },

        /**
         * Override upload options for cloudinary uploads.

         * @returns hash object.
         */
        uploadOptions: function () {
            var t = this;
            return {
                url: this.cloudinary.endpoint + this.cloudinary.cloud_name + '/image/upload',
                formData: t.cloudinary.formData,
                paramName: 'file'
            };
        },

        /**
         * Callback, gets called when a new file was dropped or selected. We need to override this, to decide if the
         * uploaded file is an image or not.
         *
         * @param data
         */
        onAdd: function (data) {
            if(this.$inputs.path.val().length > 0) {
                this.deleteData();
            }

            this.renderPreviewFromDOMFile(data.files[0]);
            if(!this.isPathImage(data.files[0].name)) {
                data.url = this.cloudinary.endpoint + this.cloudinary.cloud_name + '/raw/upload';
            }
            return data;
        },

        /**
         * Callback to save the data to the DOM fields after uploading successfully.
         *
         * @param data
         * @param callback
         */
        saveData: function(data, callback) {
            this.delete_token = data.delete_token;
            delete data.delete_token;
            this.$inputs.path.val(data.secure_url);
            this.$inputs.data.val(JSON.stringify(data));
            if(callback != undefined) {
                callback();
            }
        },

        /**
         * Callback, when user clicks on delete. We need to delete the file @ cloudinary here.
         *
         * @param callback
         */
        deleteData: function(callback) {
            var t = this;
            var url = t.cloudinary.endpoint + '/' + t.cloudinary.cloud_name + '/image/destroy';
            var data = t.cloudinary.imageData;

            if(t.delete_token) {
                url = t.cloudinary.endpoint + '/' + t.cloudinary.cloud_name + '/delete_by_token';
                data = {token: t.delete_token};
            }

            $.post(url, data, function(){
                t.delete_token = null;
                t.$inputs.path.val('');
                t.$inputs.data.val('');
                if(callback != undefined) {
                    callback();
                }
            });

        }
    }));
};