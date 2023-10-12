package com.spring.chatserver.model;


import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Setter
@Getter
@Entity
@Builder
@NoArgsConstructor
@Table(name = "messages")
public class Messages {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id", columnDefinition = "BIGINT UNSIGNED")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sent_by", nullable = false, insertable=true, updatable=false)
    @NotNull
    private User sentBy;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sent_to", nullable = false, insertable = true, updatable = false)
    @NotNull
    private User sentTo;

    @Column(name = "message", length = 256)
    @NotNull
    private String message;

    @Column(name = "status", length = 1)
    @NotNull
    private String status;

    public Messages(Long id, User sentBy, User sentTo, String message, String status) {
        this.id = id;
        this.sentBy = sentBy;
        this.sentTo = sentTo;
        this.message = message;
        this.status = status;
    }
}
