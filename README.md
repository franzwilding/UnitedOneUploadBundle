# UnitedOneUploadBundle

File & Image upload form type for united cms. Files can be uploaded to the webserver or any other third party service.
You can simply create your own custom upload handler to upload to any API. 
 
Default implementations: 

- simple file upload
- cloudinary file (image & raw) upload

![Upload field type](http://res.cloudinary.com/tworobots/image/upload/v1429693951/upload_pmuxfp.jpg)

# Installation

Install symfony
    
    composer create-project symfony/framework-standard-edition
        
Install UnitedOneUploadBundle  
    
    composer require franzwilding/united-one-upload-bundle
    
Register United bundles 
    
    /* 
     * Optional, if you want to use the Upload bundle with United CMS 
     * new United\CoreBundle\UnitedCoreBundle(),
     * new United\OneBundle\UnitedOneBundle(), 
     */
    
    new United\OneUploadBundle\UnitedOneUploadBundle(), 

Add UnitedOneUploadBundle fields as twig form resource and add the register it for assetic. 

    # Twig Configuration
    twig:
        form:
          resources:
              - UnitedOneUploadBundle:Form:fields.html.twig

    # Assetic Configuration
    assetic:
        bundles:        [ 'UnitedOneUploadBundle' ]

Use the new form types:

    united_file, united_cloudinary_file

**Check out the Getting started tutorial (Comming soon)**