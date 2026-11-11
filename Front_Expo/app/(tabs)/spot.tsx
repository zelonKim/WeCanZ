import { getActiveAds } from "@/api/spot/getActiveAds";
import { increaseClickCount } from "@/api/spot/postAdClick";
import { AdsInfoModal } from "@/components/AdsInfoModal";

import Colors from "@/constants/Colors";
import { useCommercialLanguage } from "@/hooks/Languages/useCommercialLanguage";
import { AdItem } from "@/types/spot/AdItem";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CommercialScreen() {
  const t = useCommercialLanguage();
  const [modalVisible, setModalVisible] = useState(false);

  const {
    data: ads = [],
    isPending,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["activeCommercialAds"],
    queryFn: getActiveAds,
  });

  ////////////////////////////////////////////////////////////////////////

  const { mutate: ClickCountMutation } = useMutation({
    mutationFn: increaseClickCount,
    onError: (error) => {
      console.log(error);
    },
  });

  ////////////////////////////////////////////////////////////////////////

  const handleAdClick = async (ad: AdItem) => {
    ClickCountMutation(ad.id);

    if (ad.linkUrl) {
      try {
        const canOpen = await Linking.canOpenURL(ad.linkUrl);
        if (canOpen) {
          await Linking.openURL(ad.linkUrl);
        } else {
          Alert.alert("Error", t.linkError);
        }
      } catch (error) {
        console.error("링크 이동 중 오류 발생:", error);
      }
    }
  };

  ////////////////////////////////////////////////////////////////////////

  if (isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.green} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>{t.loadError}</Text>
      </View>
    );
  }

  ////////////////////////////////////////////////////////////////////////

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.headerTitle}</Text>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.5}
        >
          <Ionicons
            name="information-circle-outline"
            size={26}
            color={Colors.green}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={ads}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => handleAdClick(item)}
          >
            <Image
              source={{ uri: item.imageUrl || item.store.imageUrl }}
              style={styles.cardImage}
              resizeMode="cover"
            />

            <View style={styles.cardContent}>
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{t.adBadge}</Text>
              </View>

              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description} numberOfLines={3}>
                {item.content}
              </Text>

              <View style={styles.infoRow}>
                <Text style={styles.storeName}>{item.store.name}</Text>

                <Text style={styles.infoText}>📍 {item.store.address}</Text>
                <Text style={styles.infoText}>
                  {t.hoursLabel} {item.store.openTime} ~ {item.store.closeTime}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>{t.emptyText}</Text>
          </View>
        }
      />

      <AdsInfoModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={t.modalTitle}
        description={t.modalDescription}
        emailLabel={t.modalEmailLabel}
        closeText={t.modalClose}
        styles={styles}
      />
    </SafeAreaView>
  );
}

////////////////////////////////////////////////////////////////////////

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: -50,
    backgroundColor: "#09090B",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border || "#E9ECEF",
    marginBottom: 8,
  },
  headerIconBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.green,
    fontStyle: "italic",
    letterSpacing: -0.5,
  },

  iconButton: {
    padding: 4,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 280,
  },
  card: {
    borderRadius: 12,
    marginBottom: 24,
    overflow: "hidden",
    backgroundColor: Colors.card,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  cardImage: {
    width: "100%",
    aspectRatio: 1,
  },

  cardContent: {
    padding: 16,
  },
  badgeContainer: {
    alignSelf: "flex-start",
    backgroundColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  badgeText: {
    color: Colors.tabIconDefault,
    fontSize: 9,
    fontWeight: "bold",
  },
  storeName: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
    fontWeight: "400",
  },
  title: {
    fontSize: Platform.OS === "ios" ? 18 : 17,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 6,
  },
  description: {
    fontSize: Platform.OS === "ios" ? 13.5 : 12.5,
    color: Colors.tabIconDefault,
    lineHeight: 20,
    maxHeight: 200,
    marginBottom: 16,
  },
  infoRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: Colors.tabIconDefault,
  },
  emptyText: {
    fontSize: 15,
    color: "#888",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.card || "#ffffff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    color: Colors.tabIconDefault,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 25,
    marginTop: 5,
  },
  modalSubText: {
    fontSize: 13,
    color: Colors.text,
    marginBottom: 6,
    fontWeight: "500",
  },
  modalCloseButton: {
    marginTop: 16,
    backgroundColor: "#333",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
