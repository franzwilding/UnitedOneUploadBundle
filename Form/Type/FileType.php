<?php

namespace United\OneUploadBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;
use United\OneUploadBundle\Form\DataTransformer\UnitedFileTransformer;

class FileType extends AbstractType
{

    /**
     * @return UnitedFileTransformer
     */
    protected function getTransformer()
    {
        return new UnitedFileTransformer();
    }

    protected function getUploadHandlerName()
    {
        return 'united_file';
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
          ->add('path', 'hidden')
          ->add('data', 'hidden')
          ->addModelTransformer($this->getTransformer());
    }

    /**
     * {@inheritdoc}
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'required' => false,
            'upload_url' => NULL,
        ));
    }

    /**
     * {@inheritdoc}
     */
    public function buildView(FormView $view, FormInterface $form, array $options)
    {
        $view->vars['widget_data'] = ' data-upload-handler="'. $this->getUploadHandlerName() . '"';

        if($options['upload_url']) {
            $view->vars['widget_data'] .= ' data-upload-url="'. $options['upload_url'] . '"';
        }
    }

    public function getName()
    {
        return 'united_file';
    }
}