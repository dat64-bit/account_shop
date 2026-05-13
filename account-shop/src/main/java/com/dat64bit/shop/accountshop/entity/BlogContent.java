package com.dat64bit.shop.accountshop.entity;

import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "blog_content")
public class BlogContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "content_id")
    private Integer contentId;

    @Column(name = "blog_id")
    private Integer blogId;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "content_type")
    private String contentType;

    @Column(name = "heading_text")
    private String headingText;

    @Column(name = "body_text")
    private String bodyText;

    @Column(name = "media_url")
    private String mediaUrl;

}
