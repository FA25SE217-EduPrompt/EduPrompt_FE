// Error mapping utility to convert server errors to user-friendly messages
export function mapErrorToUserMessage(error: any): string {
  
  if (typeof error === 'string') {
    return error;
  }

  // extract error message from response 
  let message = '';
  
  if (error?.response?.data?.error?.messages?.[0]) {
    message = error.response.data.error.messages[0];
  } else if (error?.response?.data?.message) {
    message = error.response.data.message;
  } else if (error?.message) {
    message = error.message;
  } else if (error?.error?.messages?.[0]) {
    message = error.error.messages[0];
  } else if (error?.error?.message) {
    message = error.error.message;
  }

  // map common server errors to user-friendly messages
  const errorMappings: { [key: string]: string } = {
    // Authentication errors
    'Invalid credentials': 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại thông tin đăng nhập.',
    'User not found': 'Không tìm thấy tài khoản với email này. Vui lòng kiểm tra lại email hoặc đăng ký tài khoản mới.',
    'Invalid email or password': 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại thông tin đăng nhập.',
    'Email already exists': 'Email này đã được sử dụng. Vui lòng sử dụng email khác hoặc đăng nhập.',
    'Email already registered': 'Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.',
    'Invalid email format': 'Định dạng email không hợp lệ. Vui lòng nhập email đúng định dạng.',
    'Password too weak': 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn (ít nhất 8 ký tự).',
    'Password does not match': 'Mật khẩu không khớp. Vui lòng kiểm tra lại.',
    'Account not verified': 'Tài khoản chưa được xác minh. Vui lòng kiểm tra email để xác minh tài khoản.',
    'Account is locked': 'Tài khoản đã bị khóa. Vui lòng liên hệ hỗ trợ để được giúp đỡ.',
    'Session expired': 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
    'Invalid token': 'Mã xác thực không hợp lệ. Vui lòng thử lại.',
    'Token expired': 'Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới.',
    
    // Network errors
    'Network Error': 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet và thử lại.',
    'Request timeout': 'Yêu cầu quá thời gian chờ. Vui lòng thử lại sau.',
    'Server error': 'Lỗi máy chủ. Vui lòng thử lại sau ít phút.',
    'Service unavailable': 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.',
    
    // Validation errors
    'Required field missing': 'Vui lòng điền đầy đủ thông tin bắt buộc.',
    'Invalid phone number': 'Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại đúng định dạng.',
    'Phone number already exists': 'Số điện thoại này đã được sử dụng. Vui lòng sử dụng số khác.',
    'Name is required': 'Vui lòng nhập họ và tên.',
    'Email is required': 'Vui lòng nhập địa chỉ email.',
    'Password is required': 'Vui lòng nhập mật khẩu.',
    
    // Google OAuth errors
    'Google authentication failed': 'Đăng nhập Google thất bại. Vui lòng thử lại.',
    'Invalid Google token': 'Mã xác thực Google không hợp lệ. Vui lòng thử lại.',
    'Google account not found': 'Không tìm thấy tài khoản Google. Vui lòng thử lại.',
    
    // Generic fallbacks
    'Unauthorized': 'Bạn không có quyền thực hiện hành động này.',
    'Forbidden': 'Truy cập bị từ chối. Vui lòng liên hệ quản trị viên.',
    'Not found': 'Không tìm thấy thông tin yêu cầu.',
    'Bad request': 'Yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông tin.',
    'Internal server error': 'Lỗi hệ thống. Vui lòng thử lại sau.',
  };

  // check for exact matches first
  if (errorMappings[message]) {
    return errorMappings[message];
  }

  // check for partial matches (case insensitive)
  const lowerMessage = message.toLowerCase();
  for (const [key, value] of Object.entries(errorMappings)) {
    if (lowerMessage.includes(key.toLowerCase())) {
      return value;
    }
  }

  // check for HTTP status codes
  if (error?.response?.status) {
    const status = error.response.status;
    switch (status) {
      case 400:
        return 'Thông tin không hợp lệ. Vui lòng kiểm tra lại dữ liệu nhập vào.';
      case 401:
        return 'Thông tin đăng nhập không đúng. Vui lòng kiểm tra lại email và mật khẩu.';
      case 403:
        return 'Bạn không có quyền thực hiện hành động này.';
      case 404:
        return 'Không tìm thấy tài nguyên yêu cầu.';
      case 409:
        return 'Thông tin đã tồn tại. Vui lòng sử dụng thông tin khác.';
      case 422:
        return 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.';
      case 429:
        return 'Quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.';
      case 500:
        return 'Lỗi máy chủ. Vui lòng thử lại sau.';
      case 502:
      case 503:
      case 504:
        return 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.';
      default:
        break;
    }
  }

  // If no mapping found, return a generic user-friendly message
  if (message) {
    return `Có lỗi xảy ra: ${message}`;
  }

  return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.';
}

// Helper function to determine error type based on the error
export function getErrorType(error: any): "error" | "warning" | "info" {
  if (error?.response?.status) {
    const status = error.response.status;
    if (status >= 400 && status < 500) {
      return "warning"; // Client errors are warnings
    } else if (status >= 500) {
      return "error"; // Server errors are errors
    }
  }
  
  return "error";
}
