import { Carousel } from 'antd';

export const Banner = () => (
  <Carousel autoplay style={{ borderRadius: '10px', overflow: 'hidden' }}>
    <div>
      <div style={{ height: '300px', background: '#bae7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Banner 1
      </div>
    </div>
    <div>
      <div style={{ height: '300px', background: '#d9f7be', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Banner 2
      </div>
    </div>
  </Carousel>
);