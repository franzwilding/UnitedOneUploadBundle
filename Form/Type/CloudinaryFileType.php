<?php

namespace United\OneUploadBundle\Form\Type;

use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class CloudinaryFileType extends FileType
{
    protected function getUploadHandlerName()
    {
        return 'united_cloudinary_file';
    }

    public function getParent()
    {
        return 'united_file';
    }

    public function getName()
    {
        return 'united_cloudinary_file';
    }

    private function cloudinaryOptions(){
        return array(
          'endpoint'                => 'https://api.cloudinary.com/v1_1/',
          'cloud_name'              => NULL,
          'api_key'                 => NULL,
          'secret'                  => NULL,
          'colors'                  => false,
          'image_metadata'          => false,
          'phash'                   => false,
          'tags'                    => array(),
          'exif'                    => false,
          'folder'                  => NULL,
          'upload_preset'           => NULL,
        );
    }

    /**
     * Prepares the option object to pass to the js function.
     *
     * @param array $options
     * @param null|array $form_data
     * @return \stdClass
     */
    private function prepareOptionObject($options, $form_data = NULL){

        $data = new \stdClass();
        $data->cloud_name = $options['cloud_name'];
        $data->endpoint = $options['endpoint'];
        $data->formData = array(
          'colors'                => $options['colors'] ? 'true' : 'false',
          'exif'                  => $options['exif'] ? 'true' : 'false',
          'image_metadata'        => $options['image_metadata'] ? 'true' : 'false',
          'phash'                 => $options['phash'] ? 'true' : 'false',
          'return_delete_token'   => 'true',
          'timestamp'             => time(),
        );

        if($options['folder']) {
            $data->formData['folder'] = $options['folder'];
        }

        if(count($options['tags']) > 0) {
            $data->formData['tags'] = join(',', $options['tags']);
        }

        if($options['upload_preset']) {
            $data->formData['upload_preset'] = $options['upload_preset'];
        }

        ksort($data->formData);

        $data->formData['signature'] = $this->generateSignature($data->formData, $options['secret']);
        $data->formData['api_key'] = $options['api_key'];

        if($form_data && is_array($form_data) > 0) {
            $formData = json_decode($form_data['data']);
            $data->imageData = array(
              'public_id' => $formData->public_id,
              'timestamp' => time(),
            );

            $data->imageData['signature'] = $this->generateSignature($data->imageData, $options['secret']);
            $data->imageData['api_key'] = $options['api_key'];
        }

        return $data;
    }

    /**
     * Generate signature for $data array and secret
     * @param array $data
     * @param string $secret
     * @return string
     */
    private function generateSignature($data, $secret)
    {
        $str = '';
        foreach($data as $key => $value) {
            $str .= $key . '=' . $value . '&';
        }

        $str = substr($str, 0, -1) . $secret;
        return sha1($str);
    }

    /**
     * {@inheritdoc}
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $options = $this->cloudinaryOptions();
        $options['requred'] = false;
        $resolver->setDefaults($options);
    }

    /**
     * {@inheritdoc}
     */
    public function buildView(FormView $view, FormInterface $form, array $options)
    {
        parent::buildView($view, $form, $options);
        $data = $this->prepareOptionObject($options, $view->vars['data']);
        $view->vars['widget_data'] .= ' data-cloudinary-data="'.  htmlentities(json_encode($data)) . '"';
    }
}