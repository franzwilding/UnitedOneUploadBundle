<?php

namespace United\OneUploadBundle\Util;

use Doctrine\Common\Collections\ArrayCollection;

class UnitedFile
{

    /**
     * @var string $path
     */
    private $path;

    /**
     * @var ArrayCollection $data
     */
    private $data;

    /**
     * @param string $path
     * @param ArrayCollection|array $data
     */
    public function __construct($path, $data = array())
    {
        $this->setPath($path);
        $this->data = new ArrayCollection();
        $this->setData($data);
    }

    /**
     * @param string $path
     * @return UnitedFile
     */
    public function setPath($path)
    {
        $this->path = $path;
        return $this;
    }

    /**
     * @return string
     */
    public function getPath()
    {
        return $this->path;
    }

    /**
     * @param ArrayCollection|array $data
     * @return UnitedFile
     */
    public function setData($data)
    {
        if($data instanceof ArrayCollection) {
            $this->data = $data;
        }

        if(is_array($data)) {
            foreach($data as $key => $value) {
                $this->data->set($key, $value);
            }
        }
    }

    /**
     * @return ArrayCollection
     */
    public function getData()
    {
        return $this->data;
    }

    public function toArray()
    {
        return array(
            'path' => $this->getPath(),
            'data' => json_encode($this->getData()->toArray()),
        );
    }
}