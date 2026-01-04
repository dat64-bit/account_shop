package com.dat64bit.shop.accountshop.service;

import com.dat64bit.shop.accountshop.dto.request.LoginRequest;
import com.dat64bit.shop.accountshop.dto.response.JwtResponse; // DTO trả về
import com.dat64bit.shop.accountshop.entity.User;
import com.dat64bit.shop.accountshop.enums.AccountStatus;
import com.dat64bit.shop.accountshop.repository.UserRepository;
import com.dat64bit.shop.accountshop.util.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder; // Thư viện mã hóa pass
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    // PasswordEncoder dung de so sanh mat khau da ma hoa
    @Autowired
    private PasswordEncoder passwordEncoder;

    public JwtResponse login(LoginRequest request) {
        // 1. Tim user trong DB (Dùng orElseThrow cho gọn code)
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại!"));

        // 2. check Password
        // passwordEncoder.matches(pass nhap vao, pass trong db)
        if (!request.getPassword().equals(user.getPassword())) {
            throw new RuntimeException("Mật khẩu không chính xác!");
        }

//        // 3. check trang thai tai khoan (Status)
//        //tai khoan bi khoa vinh vien
//        if (user.getStatus().equals(AccountStatus.LOCKED.toString())) {
//            throw new RuntimeException("Tài khoản đang bị khóa!");
//        }
//        // tai khoan chua xa thuc
//        if (user.getStatus().equals(AccountStatus.UNVERIFIED.toString())) {
//            throw new RuntimeException("Vui lòng xác thực email trước khi đăng nhập!");
//        }

        // 4. dang nhap thanh cong thi tao chuoi jwt
        String token = jwtUtils.getJwtToken(user.getUsername(), user.getRole());

        // 5. tra ve chuoi jwt
        return new JwtResponse(token,"Bearer", "Đăng nhập thành công!", user.getUsername(), user.getRole());
    }
}
