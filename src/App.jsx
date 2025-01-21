import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { AlertCircle, Check, Plane, Loader2 } from 'lucide-react';
import backgroundImage from './backimage3.png';

// 로고 컴포넌트
const Logo = ({ onClick }) => (
  <h1 
    onClick={onClick} 
    className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-800 transition-colors flex items-center font-['Pretendard']"
  >
    <span className="text-blue-800 mr-2">●</span>
    PestsFree
  </h1>
);

// 메인 화면 컴포넌트
const WelcomeScreen = ({ onStart }) => (
  <div className="min-h-screen flex items-center justify-center p-4 font-['Pretendard']"
    style={{
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'relative',
    }}>
    <div className="absolute inset-0 bg-black bg-opacity-50"></div>
    <div className="max-w-2xl w-full relative z-10">
      <div className="bg-white bg-opacity-95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-8 text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center justify-center">
            <span className="text-blue-800 mr-3">●</span>
            PestsFree
          </h1>
          <p className="text-lg text-gray-700 leading-relaxed mb-2">
            드론을 이용한 스마트한 병/해충 관리 시스템
          </p>
          <p className="text-sm text-gray-500">
            정확하고 효율적인 병해충 탐지로 농작물을 보호합니다
          </p>
        </div>
        <button
          onClick={onStart}
          className="bg-blue-800 hover:bg-blue-900 text-white px-8 py-3 rounded-md text-base font-medium 
          transition-all shadow-sm hover:shadow-md w-full max-w-md"
        >
          시스템 시작하기
        </button>
      </div>
    </div>
  </div>
);

// 상태 표시 컴포넌트
const StatusIndicator = ({ connected }) => (
  <div className={`flex items-center space-x-2 ${connected ? 'text-green-700' : 'text-gray-600'}
    border rounded-md px-4 py-2 bg-white shadow-sm font-['Pretendard']`}>
    <Plane className="h-5 w-5" />
    <span className="text-sm font-medium">
      {connected ? '드론 연결됨' : '연결 중...'}
    </span>
  </div>
);

// 체크리스트 아이템 컴포넌트
const ChecklistItem = ({ title, description, checked, error }) => (
  <div className="flex items-start space-x-3 border rounded-md p-4 bg-white shadow-sm font-['Pretendard']">
    <div className={`mt-1 p-1 rounded-full ${
      error ? 'bg-red-50 text-red-700' : 
      checked ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
    }`}>
      {error ? (
        <AlertCircle className="w-4 h-4" />
      ) : checked ? (
        <Check className="w-4 h-4" />
      ) : (
        <AlertCircle className="w-4 h-4" />
      )}
    </div>
    <div>
      <h3 className="font-medium text-gray-900">{title}</h3>
      <p className={`text-sm ${error ? 'text-red-700' : 'text-gray-600'}`}>{description}</p>
    </div>
  </div>
);

// Google Maps 컴포넌트
const GoogleMap = ({ markers, coordinates, onPathCreated, isDrawingPath, onMapRefs }, ref) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  // mapInstance나 markers가 업데이트될 때마다 부모 컴포넌트에 전달
  useEffect(() => {
    if (onMapRefs) {
      onMapRefs({
        mapInstance: mapInstance.current,
        markers: markersRef.current
      });
    }
  }, [onMapRefs, markers]);

  // 특정 위치로 지도 이동 함수 수정
  const moveToLocation = (lat, lng) => {
    if (mapInstance.current) {
      // 먼저 현재 줌 레벨을 저장
      const currentZoom = mapInstance.current.getZoom();
      
      // 현재 줌 레벨이 목표 줌 레벨보다 높다면 먼저 줌 아웃
      if (currentZoom > 18) {
        mapInstance.current.setZoom(18);
      }
      
      // 위치 이동
      mapInstance.current.setCenter({ lat, lng });
      
      // 약간의 지연 후 줌 레벨 조정
      setTimeout(() => {
        mapInstance.current.setZoom(18);
      }, 100);
    }
  };

  // 컴포넌트 props로 moveToLocation 함수 노출
  React.useImperativeHandle(ref, () => ({
    moveToLocation
  }));

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current) return;

      const defaultCenter = { lat: 37.5665, lng: 126.9780 };
      const center = coordinates || defaultCenter;

      const map = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: 17,
        mapTypeId: 'satellite',
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
        tilt: 0,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: window.google.maps.ControlPosition.TOP_RIGHT,
        },
      });

      mapInstance.current = map;

      if (coordinates) {
        new window.google.maps.Marker({
          position: coordinates,
          map: map,
          title: '현재 위치',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#4299e1',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });
      }
    };

    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&callback=initGoogleMap`;
      script.async = true;
      script.defer = true;

      window.initGoogleMap = () => {
        initMap();
        delete window.initGoogleMap;
      };

      document.head.appendChild(script);

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
        if (window.initGoogleMap) {
          delete window.initGoogleMap;
        }
      };
    };

    const cleanup = loadGoogleMaps();

    return () => {
      if (cleanup) cleanup();
      // 마커와 InfoWindow 정리
      if (markersRef.current) {
        markersRef.current.forEach(marker => {
          if (marker.mapMarker) {
            marker.mapMarker.setMap(null);
          }
          if (marker.infoWindow) {
            marker.infoWindow.close();
          }
        });
        markersRef.current = [];
      }
    };
  }, [coordinates]);

  // 마커 업데이트
  useEffect(() => {
    if (!mapInstance.current || !window.google || !window.google.maps) return;

    // 기존 마커들 제거
    markersRef.current.forEach(marker => {
      if (marker.mapMarker) {
        marker.mapMarker.setMap(null);
      }
      if (marker.infoWindow) {
        marker.infoWindow.close();
      }
    });
    markersRef.current = [];

    markers.forEach((markerData) => {
      const { lat, lng, detectionType } = markerData;

      if (detectionType) {
        const infowindowContent = detectionType === 'pest' ? 
          `<div class="p-2" style="margin:0;padding:8px;font-family:'Noto Sans KR',sans-serif;">위도: ${lat.toFixed(6)}
경도: ${lng.toFixed(6)}
<p class="font-medium text-red-600" style="margin:4px 0;">충해 발견</p>
<img src="https://jeju-cloud-03-bugimagetest.s3.us-east-1.amazonaws.com/bugbug.jpeg" 
  alt="발견된 해충" style="width:200px;height:150px;object-fit:cover;margin-top:8px;" /></div>` 
        : `<div class="p-2" style="margin:0;padding:8px;font-family:'Noto Sans KR',sans-serif;">위도: ${lat.toFixed(6)}
경도: ${lng.toFixed(6)}
<p class="font-medium text-yellow-800" style="margin:4px 0;">병해 발견</p>
<img src="https://jeju-cloud-03-bugimagetest.s3.us-east-1.amazonaws.com/disease.jpeg" 
  alt="발견된 병해" style="width:200px;height:150px;object-fit:cover;margin-top:8px;" /></div>`;

        const markerIcon = {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: detectionType === 'pest' ? '#f56565' : '#8B4513',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        };

        const mapMarker = new window.google.maps.Marker({
          position: { lat, lng },
          map: mapInstance.current,
          icon: markerIcon,
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: infowindowContent,
        });

        mapMarker.addListener('click', () => {
          markersRef.current.forEach(marker => {
            if (marker.infoWindow) {
              marker.infoWindow.close();
            }
          });
          infoWindow.open(mapInstance.current, mapMarker);
        });

        markersRef.current.push({
          mapMarker,
          infoWindow,
          ...markerData
        });
      }
    });
  }, [coordinates, markers]);

  return (
    <div 
      ref={mapRef} 
      style={{ 
        width: '100%', 
        height: '400px',
        position: 'relative',
        overflow: 'hidden'
      }}
      className="rounded-lg shadow-md"
    />
  );
};

// forwardRef로 감싸기
const GoogleMapWithRef = forwardRef(GoogleMap);

// 시스템 점검 화면 컴포넌트
const SystemCheckScreen = ({ onLogoClick }) => {
  const [status, setStatus] = useState({
    location: false,
    droneConnection: false
  });
  const [coordinates, setCoordinates] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [searchStarted, setSearchStarted] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const mapRef = useRef(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const markersRef = useRef([]);
  const mapInstance = useRef(null);

  const getLocation = () => {
    setLocationError(null);
    setStatus(prev => ({ ...prev, location: false }));
    
    if (!navigator.geolocation) {
      setLocationError('브라우저가 위치 정보를 지원하지 않습니다.');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setStatus(prev => ({ ...prev, location: true }));
        setLocationError(null);
      },
      (error) => {
        let errorMessage;
        switch (error.code) {
          case 1:
            errorMessage = '위치 정보 접근 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.';
            break;
          case 2:
            errorMessage = '현재 위치 정보를 사용할 수 없습니다. 잠시 후 다시 시도해주세요.';
            break;
          case 3:
            errorMessage = '위치 정보 요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.';
            break;
          default:
            errorMessage = `위치 정보를 가져오는 중 오류가 발생했습니다. (${error.message})`;
        }
        setLocationError(errorMessage);
        setStatus(prev => ({ ...prev, location: false }));
      },
      options
    );
  };

  useEffect(() => {
    // 초기 위치 정보 가져오기
    getLocation();

    // 드론 연결 시뮬레이션
    const droneConnectionTimeout = setTimeout(() => {
      setStatus(prev => ({ ...prev, droneConnection: true }));
    }, 2000);

    return () => {
      clearTimeout(droneConnectionTimeout);
    };
  }, []);

  // 임시 객체 인식 시뮬레이션
  useEffect(() => {
    if (searchStarted && coordinates) {
      const detectedMarkers = [];
      let lastPosition = {
        lat: coordinates.lat,
        lng: coordinates.lng
      };

      // 경과 시간 타이머 설정
      const startTime = Date.now();
      const timeInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);

      let direction = 1;
      let row = 0;
      const stepSize = 0.0002;
      const rowHeight = 0.0001;
      const diagonalFactor = 0.3;

      const simulatePestDetection = () => {
        const diagonalOffset = direction * stepSize * diagonalFactor;
        lastPosition = {
          lat: lastPosition.lat + diagonalOffset,
          lng: lastPosition.lng + (stepSize * direction)
        };

        const maxDistance = 0.002;
        if (Math.abs(lastPosition.lng - coordinates.lng) > maxDistance) {
          row++;
          const newRow = coordinates.lat + (row * rowHeight);
          lastPosition = {
            lat: newRow + (diagonalOffset * 2),
            lng: direction > 0 ? 
              coordinates.lng + maxDistance : 
              coordinates.lng - maxDistance
          };
          direction *= -1;
        }

        const isPestDetected = Math.random() > 0.7;
        const isDiseaseDetected = !isPestDetected && Math.random() > 0.7;
        const detectionType = isPestDetected ? 'pest' : (isDiseaseDetected ? 'disease' : null);

        const newMarker = { 
          ...lastPosition,
          detectionType
        };

        if (detectionType) {
          detectedMarkers.push(newMarker);
          setMarkers([...detectedMarkers]);
          
          // 새로운 감지 시에는 중심만 이동
          if (mapInstance.current) {
            mapInstance.current.setCenter({ lat: lastPosition.lat, lng: lastPosition.lng });
          }
        }
      };

      const detectionInterval = setInterval(simulatePestDetection, 3000);

      const searchTimeout = setTimeout(() => {
        clearInterval(detectionInterval);
        clearInterval(timeInterval);
        setSearchStarted(false);
        setSearchResults(detectedMarkers);
        setElapsedTime(0);
        const pestCount = detectedMarkers.filter(marker => marker.detectionType === 'pest').length;
        const diseaseCount = detectedMarkers.filter(marker => marker.detectionType === 'disease').length;
        alert(`탐색이 완료되었습니다.\n충해: ${pestCount}건\n병해: ${diseaseCount}건이 발견되었습니다.`);
      }, 30000);

      return () => {
        clearInterval(detectionInterval);
        clearInterval(timeInterval);
        clearTimeout(searchTimeout);
      };
    }
  }, [searchStarted, coordinates]);

  const handleStartSearch = () => {
    setSearchStarted(true);
    setMarkers([]);
    setSearchResults(null);
    setShowResults(false);
    setElapsedTime(0);
  };

  // 목록에서 위치 클릭 시 동작하는 함수
  const handleLocationClick = (lat, lng) => {
    if (mapInstance.current) {
      // 먼저 모든 InfoWindow 닫기
      markersRef.current.forEach(marker => {
        if (marker.infoWindow) {
          marker.infoWindow.close();
        }
      });

      // 현재 중심점과 목표 지점 사이의 중간 지점 계산
      const currentCenter = mapInstance.current.getCenter();
      const midLat = (currentCenter.lat() + lat) / 2;
      const midLng = (currentCenter.lng() + lng) / 2;
      
      // 현재 줌 레벨 저장
      const currentZoom = mapInstance.current.getZoom();
      
      // 중간 지점으로 부드럽게 이동
      mapInstance.current.panTo({ lat: midLat, lng: midLng });
      
      // 위치 이동 후 최종 목적지로 이동하며 줌인
      setTimeout(() => {
        mapInstance.current.panTo({ lat, lng });
        if (currentZoom < 18) {
          mapInstance.current.setZoom(18);
        }
        
        // 해당 마커의 InfoWindow 열기
        const clickedMarker = markersRef.current.find(
          marker => marker.lat === lat && marker.lng === lng
        );
        if (clickedMarker && clickedMarker.infoWindow) {
          clickedMarker.infoWindow.open(mapInstance.current, clickedMarker.mapMarker);
        }
      }, 300);
    }
  };

  // GoogleMap 컴포넌트에서 참조를 받아오는 함수
  const handleMapRefs = (refs) => {
    markersRef.current = refs.markers;
    mapInstance.current = refs.mapInstance;
  };

  return (
    <div className="min-h-screen font-['Pretendard']"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
      }}>
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative z-10 max-w-3xl mx-auto p-4">
        <header className="bg-white bg-opacity-95 backdrop-blur-sm border-b border-gray-200 mb-4 pb-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between px-4 py-3">
            <Logo onClick={onLogoClick} />
            <StatusIndicator connected={status.droneConnection} />
          </div>
        </header>

        <main className="space-y-4">
          <div className="bg-white bg-opacity-95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg">
            <div className="border-b border-gray-200 p-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                {searchStarted ? '탐색 진행 중...' : (searchResults ? '탐색 완료' : '시스템 점검')}
              </h2>
            </div>
            
            <div className="p-6">
              {!searchResults && !searchStarted ? (
                <>
                  <div className="w-full mb-6 border rounded-lg overflow-hidden shadow-sm" 
                    style={{ minHeight: '400px' }}>
                    <GoogleMapWithRef 
                      markers={[]} 
                      coordinates={coordinates}
                      onMapRefs={handleMapRefs}
                    />
                  </div>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-start space-x-4">
                      <ChecklistItem
                        title="위치 확인"
                        description={
                          locationError ? locationError :
                          coordinates ? 
                          `위도: ${coordinates.lat.toFixed(6)}, 경도: ${coordinates.lng.toFixed(6)}` : 
                          '위치 확인 중...'
                        }
                        checked={status.location}
                        error={locationError ? true : false}
                      />
                      {(locationError || coordinates) && (
                        <button
                          onClick={getLocation}
                          className="px-4 py-2 border text-gray-600 rounded hover:bg-gray-50 
                          transition-colors shadow-sm text-sm"
                        >
                          GPS 재설정
                        </button>
                      )}
                    </div>
                    <ChecklistItem
                      title="드론 연결 상태"
                      description={status.droneConnection 
                        ? '드론이 정상적으로 연결되었습니다' 
                        : '드론 연결 중...'}
                      checked={status.droneConnection}
                    />
                  </div>
                  <button
                    onClick={handleStartSearch}
                    disabled={!status.location || !status.droneConnection}
                    className={`w-full py-3 px-6 rounded transition-colors text-lg font-medium shadow-sm
                      ${status.location && status.droneConnection
                        ? 'bg-blue-800 hover:bg-blue-900 text-white'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    탐색 시작
                  </button>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="w-full border rounded-lg overflow-hidden shadow-sm" 
                    style={{ minHeight: '400px' }}>
                    <GoogleMapWithRef 
                      ref={mapRef}
                      markers={markers} 
                      coordinates={coordinates}
                      onMapRefs={handleMapRefs}
                    />
                  </div>
                  
                  <div className="bg-gray-50 border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b">
                      <h3 className="text-lg font-medium text-gray-900">
                        {searchStarted ? '실시간 탐지 현황' : '최종 탐지 결과'}
                      </h3>
                      <div className="flex items-center space-x-3">
                        {!searchStarted ? (
                          <div className="flex items-center space-x-3">
                            <span className="bg-red-50 text-red-700 px-3 py-1 rounded-md text-sm font-medium border border-red-100">
                              충해 {markers.filter(m => m.detectionType === 'pest').length}건
                            </span>
                            <span className="bg-yellow-50 text-yellow-800 px-3 py-1 rounded-md text-sm font-medium border border-yellow-100">
                              병해 {markers.filter(m => m.detectionType === 'disease').length}건
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-3">
                            <span className="bg-red-50 text-red-700 px-3 py-1 rounded-md text-sm font-medium border border-red-100">
                              충해 {markers.filter(m => m.detectionType === 'pest').length}건
                            </span>
                            <span className="bg-yellow-50 text-yellow-800 px-3 py-1 rounded-md text-sm font-medium border border-yellow-100">
                              병해 {markers.filter(m => m.detectionType === 'disease').length}건
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {searchStarted ? (
                      <div className="flex flex-col items-center space-y-4 py-8">
                        <Loader2 className="w-10 h-10 text-blue-800 animate-spin" />
                        <p className="text-gray-700 text-center font-medium">
                          드론이 이동하며 해충을 탐지하고 있습니다.
                          <br />
                          <span className="text-sm text-gray-500 mt-2 block">경과 시간: {elapsedTime}초</span>
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {showResults ? (
                          <>
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                              {searchResults
                                .filter(result => result.detectionType)
                                .map((result, index) => (
                                <div key={index} 
                                  className={`flex items-center space-x-3 p-4 bg-white rounded-md border border-gray-200 cursor-pointer 
                                  hover:bg-gray-50 transition-colors ${
                                    result.detectionType === 'pest' ? 'hover:border-red-200' : 'hover:border-yellow-200'
                                  }`}
                                  onClick={() => handleLocationClick(result.lat, result.lng)}
                                >
                                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                    result.detectionType === 'pest' ? 'bg-red-600' : 'bg-yellow-800'
                                  }`}></span>
                                  <span className="text-gray-700 font-medium">
                                    {index + 1}번째 {result.detectionType === 'pest' ? '충해' : '병해'} 발견
                                  </span>
                                </div>
                              ))}
                            </div>
                            <button
                              onClick={() => setShowResults(false)}
                              className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-md 
                              hover:bg-gray-50 transition-colors text-sm font-medium"
                            >
                              상세 정보 접기
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setShowResults(true)}
                            className="w-full py-3 px-4 bg-gray-100 border border-gray-200 text-gray-700 rounded-md 
                            hover:bg-gray-200 transition-colors font-medium"
                          >
                            상세 정보 보기
                          </button>
                        )}
                        <button
                          onClick={handleStartSearch}
                          className="w-full bg-blue-800 text-white py-3 px-4 rounded-md 
                          hover:bg-blue-900 transition-colors shadow-md mt-4 font-medium"
                        >
                          새로운 탐색 시작
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// 메인 앱 컴포넌트
const App = () => {
  const [showSystemCheck, setShowSystemCheck] = useState(false);

  const handleLogoClick = () => {
    setShowSystemCheck(false);
  };

  return showSystemCheck ? (
    <SystemCheckScreen onLogoClick={handleLogoClick} />
  ) : (
    <WelcomeScreen onStart={() => setShowSystemCheck(true)} />
  );
};

export default App; 