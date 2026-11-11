import { MyInfo } from "@/types/user/MyInfo";
import { formatTime } from "@/utils/formatTime";
import { Image } from "expo-image";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ChatMessageItemProps {
  item: any;
  myInfo?: MyInfo;
  onDeleteMessage: (item: any) => void;
  onOpenImageModal: (uri: string) => void;
  styles: any;
}

export const ChatMessageItem = ({
  item,
  myInfo,
  onDeleteMessage,
  onOpenImageModal,
  styles,
}: ChatMessageItemProps) => {
  const isMyMessage =
    (item.senderId && item.senderId === myInfo?.id) ||
    (item.sender?.id && item.sender.id === myInfo?.id);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onLongPress={() => onDeleteMessage(item)}
      style={[
        styles.messageWrapper,
        isMyMessage ? styles.myWrapper : styles.otherWrapper,
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
        {isMyMessage && (
          <Text style={styles.timeText}>{formatTime(item.createdAt)}</Text>
        )}

        <View
          style={[
            styles.messageContainer,
            isMyMessage
              ? styles.myMessageContainer
              : styles.otherMessageContainer,
          ]}
        >
          {item.imageUrl && (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => onOpenImageModal(item.imageUrl)}
            >
              <Image
                source={{ uri: item.imageUrl }}
                style={!item.message ? styles.onlyImage : styles.chatImage}
                contentFit="cover"
              />
            </TouchableOpacity>
          )}

          {item.message ? (
            <View
              style={[
                styles.bubble,
                isMyMessage ? styles.myBubble : styles.otherBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  isMyMessage ? styles.myText : styles.otherText,
                ]}
              >
                {item.message}
              </Text>
            </View>
          ) : null}
        </View>

        {!isMyMessage && (
          <Text style={styles.timeText}>{formatTime(item.createdAt)}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};
