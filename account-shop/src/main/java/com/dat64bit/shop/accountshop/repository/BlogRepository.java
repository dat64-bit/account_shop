package com.dat64bit.shop.accountshop.repository;

import com.dat64bit.shop.accountshop.entity.Blog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BlogRepository extends JpaRepository<Blog, Integer> {

}
