import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Col, Form, Input, Layout, Modal, Popconfirm, Row, Select, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { Edit, RefreshCw, Trash2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { CustomHeader } from '@/components/layout/Header';
import { userService } from '@/features/users/services/userService';
import { CreateUserPayload, UpdateUserPayload, UserRecord, UserRole, UserStatus } from '@/types/user';

const { Content } = Layout;

type UserFormValues = CreateUserPayload & UpdateUserPayload;

const roleOptions: { label: string; value: UserRole }[] = [
  { label: 'Admin', value: 'admin' },
  { label: 'User', value: 'user' },
];

const statusOptions: { label: string; value: UserStatus }[] = [
  { label: 'Approved', value: 'approved' },
  { label: 'Attempt', value: 'attempt' },
  { label: 'Banned', value: 'banned' },
];

export const UsersPage = () => {
  const [form] = Form.useForm<UserFormValues>();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const fetchUsers = async (page = pagination.current, limit = pagination.pageSize) => {
    setLoading(true);
    setError(null);

    try {
      const response = await userService.getUsers(page, limit);
      setUsers(response.data.users);
      setPagination({
        current: response.data.currentPage,
        pageSize: limit,
        total: response.data.total,
      });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Khong the tai danh sach user. Hay dang nhap bang tai khoan admin.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, pagination.pageSize);
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ role: 'user', status: 'approved' } as UserFormValues);
    setModalOpen(true);
  };

  const openEditModal = (user: UserRecord) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      phonenumber: user.phonenumber,
      role: user.role,
      status: user.status,
      password: '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setSaving(true);

    try {
      if (editingUser) {
        await userService.updateUser(editingUser._id, {
          username: values.username,
          email: values.email,
          phonenumber: values.phonenumber,
          role: values.role,
          status: values.status,
        });
        toast.success('Da cap nhat user');
      } else {
        await userService.createUser({
          username: values.username,
          email: values.email,
          password: values.password,
          phonenumber: values.phonenumber,
        });
        toast.success('Da tao user');
      }

      closeModal();
      fetchUsers(pagination.current, pagination.pageSize);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Khong the luu user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: UserRecord) => {
    try {
      await userService.deleteUser(user._id);
      toast.success('Da xoa user');
      fetchUsers(pagination.current, pagination.pageSize);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Khong the xoa user');
    }
  };

  const handleTableChange = (nextPagination: TablePaginationConfig) => {
    fetchUsers(nextPagination.current || 1, nextPagination.pageSize || 10);
  };

  const columns = useMemo<ColumnsType<UserRecord>>(() => [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phonenumber',
      key: 'phonenumber',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: UserRole) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>{role.toUpperCase()}</Tag>
      ),
      filters: roleOptions.map(option => ({ text: option.label, value: option.value })),
      onFilter: (value, record) => record.role === value,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: UserStatus) => {
        const color = status === 'approved' ? 'green' : status === 'banned' ? 'volcano' : 'gold';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
      filters: statusOptions.map(option => ({ text: option.label, value: option.value })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value?: string) => value ? new Date(value).toLocaleDateString('vi-VN') : '-',
    },
    {
      title: '',
      key: 'actions',
      width: 112,
      render: (_, record) => (
        <Space size={8}>
          <Button
            aria-label="Edit user"
            icon={<Edit size={16} />}
            onClick={() => openEditModal(record)}
          />
          <Popconfirm
            title="Xoa user nay?"
            okText="Xoa"
            cancelText="Huy"
            onConfirm={() => handleDelete(record)}
          >
            <Button danger aria-label="Delete user" icon={<Trash2 size={16} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ], []);

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <CustomHeader />
      <Content style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: 20 }}>
        <Row align="middle" justify="space-between" gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col>
            <Typography.Title level={2} style={{ margin: 0, textAlign: 'left' }}>
              Quan ly users
            </Typography.Title>
          </Col>
          <Col>
            <Space>
              <Button icon={<RefreshCw size={16} />} onClick={() => fetchUsers()}>
                Refresh
              </Button>
              <Button type="primary" icon={<UserPlus size={16} />} onClick={openCreateModal}>
                Tao user
              </Button>
            </Space>
          </Col>
        </Row>

        {error && (
          <Alert
            type="error"
            showIcon
            message="Khong the tai users"
            description={error}
            style={{ marginBottom: 16, textAlign: 'left' }}
          />
        )}

        <Table
          rowKey="_id"
          columns={columns}
          dataSource={users}
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: 900 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
          }}
        />
      </Content>

      <Modal
        title={editingUser ? 'Sua user' : 'Tao user'}
        open={modalOpen}
        okText={editingUser ? 'Luu' : 'Tao'}
        cancelText="Huy"
        confirmLoading={saving}
        onOk={handleSubmit}
        onCancel={closeModal}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item name="username" label="Username" rules={[{ required: true, message: 'Nhap username' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Nhap email hop le' }]}>
            <Input />
          </Form.Item>
          {!editingUser && (
            <Form.Item name="password" label="Password" rules={[{ required: true, min: 6, message: 'Password toi thieu 6 ky tu' }]}>
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="phonenumber" label="Phone" rules={[{ required: true, message: 'Nhap so dien thoai' }]}>
            <Input />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="role" label="Role" rules={[{ required: true }]}>
                <Select options={roleOptions} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                <Select options={statusOptions} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </Layout>
  );
};
