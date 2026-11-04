import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export type Coordinates = {
  latitude: number;
  longitude: number;
};

function requestIOSLocationAuthorization(): Promise<void> {
  return new Promise((resolve, reject) => {
    Geolocation.requestAuthorization(
      resolve,
      error => reject(new Error(error.message || 'Quyền truy cập vị trí đã bị từ chối.')),
    );
  });
}

export async function getCurrentCoordinates(): Promise<Coordinates> {
  if (Platform.OS === 'android') {
    const permissions = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    ]);
    const granted =
      permissions[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
        PermissionsAndroid.RESULTS.GRANTED ||
      permissions[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
        PermissionsAndroid.RESULTS.GRANTED;
    if (!granted) {
      throw new Error('Bạn đã từ chối quyền truy cập vị trí.');
    }
  } else if (Platform.OS === 'ios') {
    await requestIOSLocationAuthorization();
  }

  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      error => {
        reject(
          new Error(
            error.code === 1
              ? 'Bạn đã từ chối quyền truy cập vị trí.'
              : 'Không thể lấy vị trí hiện tại. Vui lòng thử lại.',
          ),
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  });
}
