"use client";
import { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

 const BannerComponent = () => {
  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(true);

  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    swipeToSlide: true,
    adaptiveHeight: true
  };

  // Fetch banners
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch("https://mitoslearning.in/api/banners");
        
        if (!response.ok) {
          throw new Error("Failed to fetch banners");
        }

        const data = await response.json();
        const activeBanners = data.filter(banner => banner.isActive);
        setBanners(activeBanners);
      } catch (error) {
        console.error("Error fetching banners:", error);
      } finally {
        setLoadingBanners(false);
      }
    };

    fetchBanners();
  }, []);

  return (
    <div className="banner-slider-container">
      {loadingBanners ? (
        <div className="text-center py-10">Loading banners...</div>
      ) : banners.length > 0 ? (
        <Slider {...sliderSettings}>
          {banners.map((banner) => (
            <div key={banner.id}>
              <a 
                href={banner.redirectUrl} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <img 
                  className="w-full h-auto max-h-80 object-cover"
                  src={`https://mitoslearning.in${banner.imageUrl} `}
                  alt={banner.title} 
                />
              </a>
            </div>
          ))}
        </Slider>
      ) : (
        <div className="text-center py-10">No banners available</div>
      )}
    </div>
  );
};

export default BannerComponent;