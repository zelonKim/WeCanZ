import { client } from "@/api/client";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Store {
  id: string;
  name: string;
  address: string;
  openTime: string;
  closeTime: string;
  imageUrl?: string;
}

interface AdItem {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  store: Store;
}

// 1. 활성화된 광고 목록 조회 API 요청 함수
const fetchActiveAds = async (): Promise<AdItem[]> => {
  const response = await client.get("/commercial/ads");
  return response.data;
};

// 2. 광고 클릭 시 클릭 수 증가 API 요청 함수
const postAdClick = async (adId: string) => {
  await client.post(`/commercial/ads/${adId}/click`);
};

export default function CommercialScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  const {
    data: ads = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["activeCommercialAds"],
    queryFn: fetchActiveAds,
  });

  // 클릭 수 증가 뮤테이션
  const { mutate: recordClick } = useMutation({
    mutationFn: postAdClick,
    onError: (error) => {
      console.error("클릭 수 증가 실패:", error);
    },
  });

  // 광고 카드 클릭 핸들러
  const handleAdClick = async (ad: AdItem) => {
    recordClick(ad.id);

    if (ad.linkUrl) {
      try {
        const canOpen = await Linking.canOpenURL(ad.linkUrl);
        if (canOpen) {
          await Linking.openURL(ad.linkUrl);
        }
      } catch (error) {
        console.error("링크 이동 중 오류 발생:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.yellow} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>광고를 불러오는 데 실패했습니다.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* 상단 커스텀 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerIconBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>가게 정보</Text>

        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.headerIconBtn}
          activeOpacity={0.7}
        >
          <Ionicons
            name="information-circle-outline"
            size={24}
            color={Colors.text}
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
            {(item.imageUrl || item.store.imageUrl) && (
              <Image
                source={{ uri: item.imageUrl || item.store.imageUrl }}
                style={styles.cardImage}
                resizeMode="cover"
              />
            )}

            <View style={styles.cardContent}>
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>제휴 광고</Text>
              </View>

              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.content}</Text>

              <View style={styles.infoRow}>
                <Text style={styles.storeName}> {item.store.name}</Text>
                <Text style={styles.infoText}>📍 {item.store.address}</Text>
                <Text style={styles.infoText}>
                  ⏰ 영업시간: {item.store.openTime} ~ {item.store.closeTime}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>
              현재 진행 중인 제휴 광고가 없습니다.
            </Text>
          </View>
        }
      />

      {/* 광고 신청 방법 안내 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📢 광고 및 제휴 신청 안내</Text>
            <Text style={styles.modalText}>
              운영하는 술집이나 클럽 등 제휴 광고를 {"\n"} 원하시는 사장님께서는
              아래 채널로 {"\n"} 문의해 주세요.
            </Text>
            <View
              style={{
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-start",
              }}
            >
              <Text style={styles.modalSubText}>
                • 이메일: ksz18601@gmail.com
              </Text>
              <Text style={styles.modalSubText}> • LINE 아이디: sj1860</Text>
            </View>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    marginBottom: 8,
  },
  headerIconBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: Colors.text,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  card: {
    borderRadius: 12,
    marginBottom: 16,
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
    height: 180,
  },
  cardContent: {
    padding: 16,
  },
  badgeContainer: {
    alignSelf: "flex-start",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  badgeText: {
    color: "#2E7D32",
    fontSize: 10,
    fontWeight: "bold",
  },
  storeName: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
    fontWeight: "400",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: Colors.tabIconDefault,
    lineHeight: 20,
    maxHeight: 100,
  },
  infoRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.tabIconDefault,
    paddingTop: 10,
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
