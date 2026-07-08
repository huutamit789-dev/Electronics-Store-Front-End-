import React, { useEffect, useState } from 'react';
import { Layout, Row, Col, Typography } from 'antd';
import { footerService } from '@/features/footers/services/footerService';

const { Title, Text, Link } = Typography;

export const Footer = () => {
  const [footerData, setFooterData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFooter = async () => {
      try {
        const response = await footerService.getActiveFooter();
        if (response.success && response.data) {
          setFooterData(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch footer:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFooter();
  }, []);

  if (loading) {
    return <Layout.Footer style={{ textAlign: 'center' }}>Loading...</Layout.Footer>;
  }

  if (!footerData) {
    return (
      <Layout.Footer style={{ textAlign: 'center', background: '#001529', padding: '40px 50px 20px' }}>
        <Text style={{ color: '#fff', opacity: 0.6 }}>
          Chưa có footer được cấu hình. Vui lòng thêm footer từ trang quản trị.
        </Text>
      </Layout.Footer>
    );
  }

  return (
    <Layout.Footer style={{ background: '#001529', padding: '40px 50px 20px' }} className="footer-responsive">
      <Row gutter={[32, 32]}>
        {/* Cột 1: Thông tin công ty */}
        <Col xs={24} sm={12} md={8}>
          <Title level={4} style={{ color: '#fff', marginBottom: 16, fontSize: '1.1rem' }}>
            {footerData.company_name}
          </Title>
          <Text style={{ color: '#fff', opacity: 0.8, display: 'block', lineHeight: 1.6, fontSize: '0.9rem' }}>
            {footerData.company_description}
          </Text>
        </Col>

        {/* Cột 2: Chính sách */}
        <Col xs={24} sm={12} md={8}>
          <Title level={4} style={{ color: '#fff', marginBottom: 16, fontSize: '1.1rem' }}>
            {footerData.policy_title || 'Chính sách'}
          </Title>
          {footerData.policies && footerData.policies.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {footerData.policies.map((policy: any, index: number) => (
                <Link key={index} href={policy.link} style={{ color: '#fff', opacity: 0.8, fontSize: '0.9rem' }}>
                  {policy.title}
                </Link>
              ))}
            </div>
          )}
        </Col>

        {/* Cột 3: Liên hệ */}
        <Col xs={24} sm={12} md={8}>
          <Title level={4} style={{ color: '#fff', marginBottom: 16, fontSize: '1.1rem' }}>
            {footerData.contact_title || 'Liên hệ'}
          </Title>
          {footerData.contacts && footerData.contacts.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {footerData.contacts.map((contact: any, index: number) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className={`bi ${contact.icon}`} style={{ color: '#fff', opacity: 0.8 }}></i>
                  <Text style={{ color: '#fff', opacity: 0.8, fontSize: '0.9rem' }}>
                    {contact.text}
                  </Text>
                </div>
              ))}
            </div>
          )}
        </Col>
      </Row>

      <Row style={{ marginTop: 32, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20 }}>
        <Col span={24} style={{ textAlign: 'center' }}>
          <Text style={{ color: '#fff', opacity: 0.6, fontSize: '0.85rem' }}>
            ©{new Date().getFullYear()} {footerData.company_name}. All rights reserved.
          </Text>
        </Col>
      </Row>
    </Layout.Footer>
  );
};