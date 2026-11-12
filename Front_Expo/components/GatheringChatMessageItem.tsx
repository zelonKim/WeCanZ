import { MyInfo } from "@/types/user/MyInfo";
import { formatTime } from "@/utils/formatTime";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface GatheringChatMessageItemProps {
  msg: any;
  me?: MyInfo | null;
  currentLang: string;
  activeMenuMessageId: string | null;
  onToggleMenu: (msgId: string) => void;
  onDeleteMessage: (msg: any) => void;
  onOpenImageModal: (uri: string) => void;
  renderMenuPopover?: (msg: any) => React.ReactNode;
  styles: any;
}

export const GatheringChatMessageItem = ({
  msg,
  me,
  currentLang,
  activeMenuMessageId,
  onToggleMenu,
  onDeleteMessage,
  onOpenImageModal,
  renderMenuPopover,
  styles,
}: GatheringChatMessageItemProps) => {
  const isMyMessage =
    String(msg.userId || msg.senderId) === String(me?.id) ||
    String(msg.sender?.id) === String(me?.id);

  const formattedTime = formatTime(msg.createdAt, currentLang);

  const senderInfo = msg.user || msg.sender;
  const senderNickname = senderInfo?.nickname || "";
  const senderProfileImage = senderInfo?.profileImage;

  return (
    <View
      style={[
        styles.messageWrapper,
        isMyMessage ? styles.myMessageWrapper : styles.otherMessageWrapper,
      ]}
    >
      {!isMyMessage && (
        <View style={styles.senderContainer}>
          <TouchableOpacity
            activeOpacity={me?.id ? 1 : 0.5}
            onPress={() => {
              if (senderInfo && senderInfo.id !== me?.id) {
                onToggleMenu(msg.id);
              }
            }}
          >
            {senderProfileImage ? (
              <Image
                source={{ uri: senderProfileImage }}
                style={styles.profileImage}
                contentFit="cover"
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={14} color="#8E8E93" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.senderName}>{senderNickname}</Text>
        </View>
      )}

      {/* 메뉴 팝업 (클릭 시 노출) */}
      {activeMenuMessageId === msg.id &&
        senderInfo &&
        renderMenuPopover &&
        renderMenuPopover(msg)}

      {/* 메시지 말풍선 Row */}
      <View style={styles.bubbleRow}>
        {isMyMessage && <Text style={styles.myTimestamp}>{formattedTime}</Text>}

        <TouchableOpacity
          activeOpacity={0.8}
          onLongPress={() => onDeleteMessage(msg)}
          style={[
            styles.messageContainer,
            isMyMessage
              ? styles.myMessageContainer
              : styles.otherMessageContainer,
          ]}
        >
          {msg.imageUrl && (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => onOpenImageModal(msg.imageUrl || "")}
              onLongPress={() => onDeleteMessage(msg)}
            >
              <Image
                source={{ uri: msg.imageUrl }}
                style={!msg.message ? styles.onlyImage : styles.chatImage}
                contentFit="cover"
              />
            </TouchableOpacity>
          )}

          {msg.message ? (
            <View
              style={[
                styles.bubble,
                isMyMessage ? styles.myBubble : styles.otherBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  isMyMessage ? styles.myMessageText : styles.otherMessageText,
                ]}
              >
                {msg.message}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>

        {!isMyMessage && (
          <Text style={styles.otherTimestamp}>{formattedTime}</Text>
        )}
      </View>
    </View>
  );
};
