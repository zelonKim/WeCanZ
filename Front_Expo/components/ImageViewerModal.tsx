import { ImageViewerModalProps } from "@/types/DM/ImageViewerModalProps";
import { Image } from "expo-image";
import React from "react";
import { Modal, TouchableOpacity, View } from "react-native";

export const ImageViewerModal = ({
  imageUri,
  onClose,
  styles,
}: ImageViewerModalProps) => {
  return (
    <Modal
      visible={!!imageUri}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.imageModalBackground}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.imageModalContent}>
          {imageUri && (
            <Image
              source={{ uri: imageUri }}
              style={styles.fullScreenImage}
              contentFit="contain"
            />
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
