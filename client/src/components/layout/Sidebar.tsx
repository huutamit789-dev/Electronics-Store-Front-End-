import { Menu, MenuProps } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';

// Định nghĩa kiểu cho một mục trong Menu của Ant Design
type MenuItem = Required<MenuProps>['items'][number];

interface Category {
    _id: string;
    name: string;
}

interface SidebarProps {
    categories?: Category[];
    onCategoryClick: (categoryId: string | null) => void; // Thêm prop onCategoryClick
    selectedCategoryId: string | null; // Thêm prop selectedCategoryId
}

export const Sidebar = ({ categories, onCategoryClick, selectedCategoryId }: SidebarProps) => {
    // Chuyển đổi dữ liệu từ API sang kiểu MenuItem
    const categoryItems: MenuItem[] = categories?.map(category => ({
        key: category._id,
        icon: <AppstoreOutlined />,
        label: category.name,
    })) || [];

    // Thêm một mục "Tất cả sản phẩm" để có thể hiển thị tất cả sản phẩm
    const allProductsItem: MenuItem = {
        key: 'all', // Một key đặc biệt cho "Tất cả sản phẩm"
        icon: <AppstoreOutlined />,
        label: 'Tất cả sản phẩm',
    };

    // Kết hợp cả hai mảng, mục "Tất cả sản phẩm" ở đầu
    const allItems: MenuItem[] = [allProductsItem, ...categoryItems];

    const handleMenuClick = (e: any) => {
        if (e.key === 'all') {
            onCategoryClick(null); // Khi click "Tất cả sản phẩm", truyền null để lấy tất cả
        } else {
            onCategoryClick(e.key); // Truyền ID của danh mục được chọn
        }
    };

    return (
        <Menu
            mode="vertical"
            items={allItems}
            style={{ borderRight: 0 }}
            onClick={handleMenuClick}
            selectedKeys={selectedCategoryId ? [selectedCategoryId] : ['all']} // Highlight danh mục được chọn hoặc "Tất cả sản phẩm"
        />
    );
};