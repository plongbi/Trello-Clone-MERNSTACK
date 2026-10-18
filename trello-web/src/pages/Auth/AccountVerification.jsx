import { useState, useEffect } from 'react'
import { useSearchParams, Navigate } from 'react-router-dom'
import PageLoadingSpinner from '~/components/Loading/PageLoadingSpinner'
import { verifyUserAPI } from '~/apis'

function AccountVerification() {
  // Lấy gtri email và token từ URL
  let [searchParams] = useSearchParams()
  // const email = searchParams.get('email')
  // const token = searchParams.get('token')
  const { email, token } = Object.fromEntries([...searchParams])

  // Tạo 1 biến state để biết đc là đã verify tài khoản chưa
  const [verified, setVerified] = useState(false)

  // Gọi API để verify tài khoản
  useEffect(() => {
    if (email && token) {
      verifyUserAPI({ email, token }).then(() => setVerified(true))
    }
  }, [email, token])

  // Nếu url có vấn đề thì chuyển qua trang 404
  if (!email || !token) {
    return <Navigate to="/404" />
  }

  // Nếu chưa verify thì hiện loading
  if (!verified) {
    return <PageLoadingSpinner caption="Verifying your account..." />
  }

  // Nếu ko gặp vấn đề gì + verify thành công thì chuyển về trang login
  return <Navigate to={`/login?verifiedEmail=${email}`} />
}

export default AccountVerification
