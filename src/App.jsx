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
  const pollingRef = useRef(null);

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

  // 롱폴링 함수
  const startPolling = async (markerId) => {
    let attempts = 0;
    const maxAttempts = 20; // 최대 100초 (5초 * 20)
    
    const pollStatus = async () => {
      try {
        const response = await fetch(`https://[YOUR_API_GATEWAY_URL]/status/${markerId}`);
        const data = await response.json();
        
        if (response.status === 200) {
          // 최종 결과가 준비된 경우
          if (pollingRef.current === markerId) {
            // 마커 정보 업데이트
            const updatedMarker = markersRef.current.find(m => m.id === markerId);
            if (updatedMarker) {
              updatedMarker.detectionResult = data.result;
              // InfoWindow 내용 업데이트
              if (updatedMarker.infoWindow) {
                updatedMarker.infoWindow.setContent(
                  generateInfoWindowContent(data.result)
                );
              }
            }
          }
          return true;
        } else if (response.status === 202) {
          // 아직 처리 중인 경우
          attempts++;
          if (attempts >= maxAttempts) {
            console.log('Polling timeout');
            return true;
          }
          return false;
        }
      } catch (error) {
        console.error('Polling error:', error);
        return true;
      }
    };

    // 이전 폴링 중지
    if (pollingRef.current && pollingRef.current !== markerId) {
      pollingRef.current = null;
    }

    // 새로운 폴링 시작
    pollingRef.current = markerId;
    
    const poll = async () => {
      const shouldStop = await pollStatus();
      if (!shouldStop && pollingRef.current === markerId) {
        setTimeout(poll, 5000);
      }
    };

    poll();
  };

  // InfoWindow 내용 생성 함수
  const generateInfoWindowContent = (data) => {
    const detectionType = data.pest ? 'pest' : (data.disease ? 'disease' : null);
    return `<div class="p-2" style="margin:0;padding:8px;font-family:'Noto Sans KR',sans-serif;">
      위도: ${data.latitude}
      경도: ${data.longitude}
      <p class="font-medium ${detectionType === 'pest' ? 'text-red-600' : 'text-yellow-800'}" 
         style="margin:4px 0;">
        ${detectionType === 'pest' ? '충해 발견' : '병해 발견'}
      </p>
      <img src="${data.imglink}" 
        alt="발견된 ${detectionType === 'pest' ? '해충' : '병해'}" 
        style="width:200px;height:150px;object-fit:cover;margin-top:8px;" />
      ${data.st ? '<p style="color:green;margin-top:4px;">✓ 분석 완료</p>' : 
                  '<p style="color:orange;margin-top:4px;">⟳ 분석 중...</p>'}
    </div>`;
  };

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
      const { lat, lng, detectionType, imglink } = markerData;

      if (detectionType) {
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
          content: generateInfoWindowContent(markerData)
        });

        mapMarker.addListener('click', () => {
          markersRef.current.forEach(marker => {
            if (marker.infoWindow) {
              marker.infoWindow.close();
            }
          });
          infoWindow.open(mapInstance.current, mapMarker);
          
          // 마커 클릭 시 상태 폴링 시작
          const markerId = `${lat}-${lng}`;
          startPolling(markerId);
        });

        markersRef.current.push({
          id: `${lat}-${lng}`,
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
  const [connected, setConnected] = useState(false);
  const [locationChecked, setLocationChecked] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [searchStarted, setSearchStarted] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(1);
  const [error, setError] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [mapRefs, setMapRefs] = useState(null);
  const mapRef = useRef(null);

  // S3 데이터를 가져오는 함수
  const fetchS3Data = async (fileNumber) => {
    try {
      const response = await fetch(`https://jeju-cloud-03-bugimagetest.s3.us-east-1.amazonaws.com/data${String(fileNumber).padStart(2, '0')}.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
      return null;
    }
  };

  // 마커 데이터 처리 함수
  const processMarkerData = (data) => {
    if (!data || !data.length) return;
    
    const newMarker = {
      lat: parseFloat(data[0].latitude),
      lng: parseFloat(data[0].longitude),
      detectionType: data[0].pest ? 'pest' : (data[0].disease ? 'disease' : null),
      imglink: data[0].imglink
    };

    setMarkers(prevMarkers => [...prevMarkers, newMarker]);
    if (mapRef.current) {
      mapRef.current.moveToLocation(newMarker.lat, newMarker.lng);
    }
  };

  // 주기적으로 데이터를 가져오는 효과
  useEffect(() => {
    let interval;
    if (searchStarted) {
      const startTime = Date.now();
      interval = setInterval(async () => {
        if (currentFileIndex <= 5) {
          const data = await fetchS3Data(currentFileIndex);
          if (data) {
            processMarkerData(data);
            setCurrentFileIndex(prev => prev + 1);
          }
          setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
          if (currentFileIndex === 5) {
            clearInterval(interval);
            setSearchStarted(false);
            setSearchResults(markers);
          }
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [searchStarted, currentFileIndex, markers]);

  const handleStartSearch = () => {
    setSearchStarted(true);
    setCurrentFileIndex(1);
    setMarkers([]);
    setSearchResults([]);
    setShowResults(false);
    setElapsedTime(0);
  };

  // 목록에서 위치 클릭 시 동작하는 함수
  const handleLocationClick = (lat, lng) => {
    if (mapRef.current) {
      mapRef.current.moveToLocation(lat, lng);
    }
  };

  useEffect(() => {
    // 초기 위치 정보 설정
    setCurrentLocation({ lat: 33.450701, lng: 126.570667 });
    setLocationChecked(true);
    
    // 드론 연결 시뮬레이션
    const droneConnectionTimeout = setTimeout(() => {
      setConnected(true);
    }, 2000);

    return () => clearTimeout(droneConnectionTimeout);
  }, []);

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
            <StatusIndicator connected={connected} />
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
                      coordinates={currentLocation}
                      onMapRefs={setMapRefs}
                    />
                  </div>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-start space-x-4">
                      <ChecklistItem
                        title="위치 확인"
                        description={
                          error ? error :
                          currentLocation ? 
                          `위도: ${currentLocation.lat.toFixed(6)}, 경도: ${currentLocation.lng.toFixed(6)}` : 
                          '위치 확인 중...'
                        }
                        checked={locationChecked}
                        error={error ? true : false}
                      />
                      {(error || currentLocation) && (
                        <button
                          onClick={() => {
                            setLocationChecked(false);
                            setCurrentLocation(null);
                          }}
                          className="px-4 py-2 border text-gray-600 rounded hover:bg-gray-50 
                          transition-colors shadow-sm text-sm"
                        >
                          GPS 재설정
                        </button>
                      )}
                    </div>
                    <ChecklistItem
                      title="드론 연결 상태"
                      description={connected 
                        ? '드론이 정상적으로 연결되었습니다' 
                        : '드론 연결 중...'}
                      checked={connected}
                    />
                  </div>
                  <button
                    onClick={handleStartSearch}
                    disabled={!locationChecked || !connected}
                    className={`w-full py-3 px-6 rounded transition-colors text-lg font-medium shadow-sm
                      ${locationChecked && connected
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
                      coordinates={currentLocation}
                      onMapRefs={setMapRefs}
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