import axios from 'axios'
import { toast } from 'react-toastify'
import { interceptorLoadingElements } from './formatters'
import { refreshTokenAPI } from '~/apis'
import { logoutUserAPI } from '~/redux/user/userSlice'
import { API_ROOT } from '~/utils/constants'

// Ko thể import {store} from '~/redux/store' theo cách thông thường
// Giải pháp: Inject store: kỹ thuật khi cần sử dụng biến redux store ở các file ngoài phạm vi
// component như file authorizeAxios hiện tại
// Hiểu đơn giản: khi ứng dụng chạy, code chạy vào main.jsx đầu tiên, từ đó chta gọi hàm
// inject store ngay lập tức để gán mainStore vào axiosReduxStore cục bộ trong file này

let axiosReduxStore
export const injectStore = mainStore => {
  axiosReduxStore = mainStore
}

// Khởi tạo 1 đối tượng Axios mục đích custom và cấu hình chung dự án
let authorizedAxiosInstance = axios.create({
  baseURL: API_ROOT
})

// Thời gian chờ tối đa 1 request: 10p
authorizedAxiosInstance.defaults.timeout = 10 * 60 * 1000

// withCredentials cho phép axios auto gửi cookie mỗi request lên BE
authorizedAxiosInstance.defaults.withCredentials = true

// Cấu hình Interceptor
// Interceptor request: Can thiệp vào giữa những cái request API
authorizedAxiosInstance.interceptors.request.use((config) => {
  // Kỹ thuật chặn spam click
  interceptorLoadingElements(true)

  return config
}, (error) => {
  // Do something with request error
  return Promise.reject(error)
})

// Khởi tạo 1 promise cho việc gọi api refresh_token
// Mục đích promise: khi gọi api refresh_token xong thì mới retry lại api lỗi trước đó
let refreshTokenPromise = null

// Interceptor response: Can thiệp vào giữa những cái response nhận về
authorizedAxiosInstance.interceptors.response.use((response) => {
  // Kỹ thuật chặn spam click
  interceptorLoadingElements(false)

  return response
}, (error) => {
  // Mọi mã http status code nằm ngoài phạm vi 2xx sẽ là error rơi vào đây

  // Kỹ thuật chặn spam click
  interceptorLoadingElements(false)

  // Xử lý refresh token tự động
  // TH1: Nếu nhận mã 401 từ BE thì gọi api đăng xuất luôn
  if (error.response?.status === 401) {
    axiosReduxStore.dispatch(logoutUserAPI(false))
  }

  // TH2: Nếu nhận mã 410 từ BE thì gọi api refresh token làm mới lại accessToken
  // Đầu tiên lấy các request API đang bị lỗi thông qua error.config
  const originalRequests = error.config
  if (error.response?.status === 410 && !originalRequests._retry) {
    // Gán thêm 1 gtri _retry luôn = true trong khoảng tg chờ, đảm bảo việc refresh token này
    //chỉ luôn gọi 1 lần tại 1 thời điểm
    originalRequests._retry = true

    // Ktra xem nếu chưa có refreshTokenPromise thì thực hiện việc gọi api refresh_token
    // đồng thời gán vào cho cái refreshTokenPromise
    if (!refreshTokenPromise) {
      refreshTokenPromise = refreshTokenAPI()
        .then(data => {
          // Đồng thời accessToken đã nằm trong httpOnly cookie
          return data?.accessToken
        })
        .catch((_error) => {
          // Nếu nhận bất kỳ lỗi nào từ api refresh token thì loggout luôn
          axiosReduxStore.dispatch(logoutUserAPI())
          return Promise.reject(_error)
        })
        .finally(() => {
          // Dù api có lỗi hay ko thì vẫn luôn gán lại cái refreshTokenPromise về null như đầu
          refreshTokenPromise = null
        })
    }

    // Cần return TH refreshTokenPromise chạy thành công và xử lý thêm ở đây
    // eslint-disable-next-line no-unused-vars
    return refreshTokenPromise.then(accessToken => {
      // B1: Đối với TH nếu dự án cần lưu accessToken và localStorage hoặc đâu đó thì sẽ viết thêm code ở đây

      // B2: Return axios instance kết hợp originalrequests để gọi lại api ban đầu bị lỗi
      return authorizedAxiosInstance(originalRequests)
    })
  }

  // Xử lý tập trung phần hiển thị thông báo lỗi trả về từ mọi API
  let errorMessage = error?.message
  if (error.response?.data?.message) {
    errorMessage = error.response?.data?.message
  }
  // Dùng toastify để hiện thị kqua mọi mã lỗi lên màn hình - trừ mã 410 - gone phục vụ việc tự refresh token
  if (error.response?.status !== 410) {
    toast.error(errorMessage)
  }

  return Promise.reject(error)
})

export default authorizedAxiosInstance