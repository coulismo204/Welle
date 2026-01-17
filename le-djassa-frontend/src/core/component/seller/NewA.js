import React, { useState } from 'react';
import { Layout, Form, Input, Select, Button, Row, Col, Upload, Modal } from 'antd';
import { InboxOutlined, CameraOutlined } from '@ant-design/icons';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const { Content, Footer } = Layout;
const { Option } = Select;

const NewA = () => {
  const [fileList, setFileList] = useState([]);
  const [isCameraModalVisible, setIsCameraModalVisible] = useState(false);

  const handleChange = (info) => {
    let newFileList = [...info.fileList].slice(-4);
    newFileList = newFileList.map((file) => {
      if (file.response) {
        file.url = file.response.url;
      }
      return file;
    });
    setFileList(newFileList);
  };

  const uploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList((prev) => [...prev, file]);
      return false;
    },
    fileList,
  };

  const handleOpenCameraModal = () => setIsCameraModalVisible(true);
  const handleCloseCameraModal = () => setIsCameraModalVisible(false);
  const handleCameraCapture = () => {
    // Ajouter la logique de capture de la caméra ici
    handleCloseCameraModal();
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ margin: '16px' }}>
        <div style={{ padding: 24, background: '#fff', minHeight: 360, fontWeight: 'bold' }}>
          <Form layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="NOM DU PRODUIT" style={{ fontWeight: 'bold' }}>
                  <Input placeholder="Nom du produit" style={{ fontWeight: 'bold' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="CATEGORIE N/S" style={{ fontWeight: 'bold' }}>
                  <Select placeholder="Sélectionner une catégorie" style={{ fontWeight: 'bold' }}>
                    <Option value="categorie1">Téléphone</Option>
                    <Option value="categorie2">Pc Laptop</Option>
                    <Option value="categorie3">Ordinateur Bureau</Option>
                    <Option value="categorie4">Matériels Informatique</Option>
                    <Option value="categorie5">Electromenagers</Option>
                    <Option value="categorie6">Pièces Détachées</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="LOCALISATION" style={{ fontWeight: 'bold' }}>
                  <Input placeholder="Localisation" style={{ fontWeight: 'bold' }} 
                    inputStyle={{
                      fontWeight: 'bold',
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'none',
                      borderRadius: '0',
                      boxShadow: 'none'
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="ETAT DU PRODUIT" style={{ fontWeight: 'bold' }}>
                  <Select placeholder="Sélectionner l'état du produit" style={{ fontWeight: 'bold' }}>
                    <Option value="neuf">Neuf</Option>
                    <Option value="CasiNeuf">Casi Neuf</Option>
                    <Option value="occasion">Occasion</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="PRIX DE L'ARTICLE" style={{ fontWeight: 'bold' }}>
                  <Input placeholder="Prix de l'article" style={{ fontWeight: 'bold' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="COMMISSION FIXE" style={{ fontWeight: 'bold' }}>
                  <Input value="200 fcfa" style={{ fontWeight: 'bold' , color : 'black'}} disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="FRAIS D'ENTRETIEN" style={{ fontWeight: 'bold' }}>
                  <Input value="5 %" style={{ fontWeight: 'bold' , color : 'black'}} disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="PRIX FINAL" style={{ fontWeight: 'bold' }}>
                  <Input value="PRIX DE L'ARTICLE + COMMISSION FIXE + FRAIS D'ENTRETIEN" style={{ fontWeight: 'bold' , color : 'black'}} disabled />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label="DESCRIPTION DU PRODUIT" style={{ fontWeight: 'bold' }}>
                  <Input.TextArea 
                    placeholder="Donnez une description de votre produit" 
                    style={{ 
                      fontWeight: 'bold', 
                      width: '100%',
                      height: '180px', // Même hauteur que les Upload.Dragger
                      resize: 'none' // Empêche le redimensionnement
                    }} 
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Upload.Dragger
                        accept="image/*"
                        beforeUpload={() => false}
                        showUploadList={false}
                        style={{ 
                          border: '1px dashed #d9d9d9', 
                          borderRadius: '2px',
                          background: '#fafafa',
                          height: '180px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <p className="ant-upload-drag-icon">
                          <CameraOutlined style={{ fontSize: '2em' }} />
                        </p>
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenCameraModal();
                          }}
                          style={{ fontWeight: 'bold', marginBottom: '8px' }}
                        >
                          Prendre une photo
                        </Button>
                        <p className="ant-upload-hint">Cliquez pour utiliser l'appareil photo</p>
                      </Upload.Dragger>
                    </Col>
                    <Col span={12}>
                      <Upload.Dragger {...uploadProps} listType="picture-card" accept="image/*" maxCount={4} onChange={handleChange}>
                        {fileList.length >= 4 ? null : (
                          <>
                            <p className="ant-upload-drag-icon">
                              <InboxOutlined style={{ fontSize: '2em' }} />
                            </p>
                            <Button style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                              Parcourir les photos
                            </Button>
                            <p className="ant-upload-hint">Cliquez ou faites glisser des fichiers ici</p>
                          </>
                        )}
                      </Upload.Dragger>
                    </Col>
                  </Row>
                  <Row gutter={16} style={{ marginTop: 16 }}>
                    {fileList.map((file) => (
                      <Col key={file.uid} span={6}>
                        <img
                          src={file.thumbUrl || (file.originFileObj && URL.createObjectURL(file.originFileObj))}
                          alt="thumbnail"
                          style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                        />
                      </Col>
                    ))}
                  </Row>
                </Form.Item>
              </Col>
            </Row>
            <Row justify="center" gutter={16}>
              <Col>
                <Button type="danger" style={{ backgroundColor: 'red', color: 'white', fontWeight: 'bold' }}>
                  ANNULER
                </Button>
              </Col>
              <Col>
                <Button type="primary" style={{ backgroundColor: 'green', color: 'white', fontWeight: 'bold' }}>
                  PUBLIER
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center', fontWeight: 'bold' }}>
        Ant Design ©{new Date().getFullYear()} Created by Ant UED
      </Footer>

      <Modal
        visible={isCameraModalVisible}
        title="Prendre une photo"
        onCancel={handleCloseCameraModal}
        footer={[
          <Button key="cancel" onClick={handleCloseCameraModal} style={{ fontWeight: 'bold' }}>
            Annuler
          </Button>,
          <Button key="capture" type="primary" onClick={handleCameraCapture} style={{ fontWeight: 'bold' }}>
            Capturer
          </Button>,
        ]}
      >
        <video id="cameraVideo" style={{ width: '100%' }}></video>
      </Modal>
    </Layout>
  );
};

export default NewA;
