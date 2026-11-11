import { getMyDMRooms } from "@/api/DM/getMyDMRooms";
import { getPendingDMRequests } from "@/api/DM/getPendingDMRequests";
import { getMyInfo } from "@/api/user/getMyInfo";
import { searchUserByNickname } from "@/api/user/searchUserByNickname";
import { DMRoomItem } from "@/components/DmRoomItem";
import { PendingRequestsSection } from "@/components/PendingRequestsSection";
import { renderAvatar } from "@/components/renderAvatar";
import { SendDmModal } from "@/components/SendDmModal";
import Colors from "@/constants/Colors";
import { useAcceptDmMutation } from "@/hooks/DM/useAcceptDmMutation";
import { useLeaveDmMutation } from "@/hooks/DM/useLeaveDmMutation";
import { useRejectDmMutation } from "@/hooks/DM/useRejectDmMutation";
import { useRequestDmMutation } from "@/hooks/DM/useRequestDmMutation";
import { useDmLanguage } from "@/hooks/Languages/useDmLanguage";
import { getSocket } from "@/lib/socket";
import { DirectChatRoom } from "@/types/DM/DirectChatRoom";
import { MyInfo } from "@/types/user/MyInfo";
import { handlePressDmRoom } from "@/utils/handlePressDmRoom";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DMScreen() {
  const { t, currentLang } = useDmLanguage();
  const queryClient = useQueryClient();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [targetNickname, setTargetNickname] = useState("");

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setTargetNickname("");
  };

  /////////////////////////////////////////////////////////////////////////

  const { data: myInfo } = useQuery<MyInfo>({
    queryKey: ["me"],
    queryFn: getMyInfo,
  });

  /////////////////////////////////////////////////////////////////////////

  const {
    data: pendingRequests = [],
    isPending: isDmRequestsPending,
    refetch: refetchPending,
  } = useQuery<DirectChatRoom[]>({
    queryKey: ["dm-requests-pending"],
    queryFn: getPendingDMRequests,
  });

  /////////////////////////////////////////////////////////////////////////

  const {
    data: myDMRooms = [],
    isPending: isMyDmRoomsPending,
    refetch: refetchDMRooms,
  } = useQuery<DirectChatRoom[]>({
    queryKey: ["dm-rooms"],
    queryFn: getMyDMRooms,
  });

  /////////////////////////////////////////////////////////////////////////

  const isRefreshing = isDmRequestsPending || isMyDmRoomsPending;

  const onRefresh = () => {
    refetchPending();
    refetchDMRooms();
  };

  useFocusEffect(
    useCallback(() => {
      refetchPending();
      refetchDMRooms();
    }, [refetchDMRooms, refetchPending]),
  );

  /////////////////////////////////////////////////////////////////////////

  const { mutate: acceptDmMutate } = useAcceptDmMutation(t);

  const { mutate: rejectDmMutate } = useRejectDmMutation(t);

  /////////////////////////////////////////////////////////////////////////

  const { mutate: requestDmMutate, isPending: isRequesting } =
    useRequestDmMutation(t, () => {
      setIsModalVisible(false);
      setTargetNickname("");
    });

  const handleSendDmRequest = async () => {
    if (!targetNickname.trim()) {
      Alert.alert(t.alerts.notice, t.alerts.emptyNickname);
      return;
    }
    try {
      const userData = await searchUserByNickname(targetNickname.trim());
      requestDmMutate(userData.id);
    } catch (error: any) {
      const errorMessage = t.alerts.searchFail;
      Alert.alert(t.alerts.notice, errorMessage);
    }
  };

  /////////////////////////////////////////////////////////////////////////

  const { mutate: leaveRoomMutate, isPending: isLeaving } =
    useLeaveDmMutation(t);

  const handleLeaveRoom = (roomId: any) => {
    Alert.alert(t.alerts.leaveAlertTitle, t.alerts.leaveAlertMsg, [
      { text: t.cancel, style: "cancel" },
      {
        text: t.alerts.leaveAction,
        style: "destructive",
        onPress: () => leaveRoomMutate(roomId),
      },
    ]);
  };

  /////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    if (!myInfo?.id) return;

    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      console.log("🟢 [Socket] Connected:", socket.id);
      socket.emit("joinUserRoom", { userId: myInfo.id });
    };

    const handleDmListUpdate = (payload: {
      roomId: string;
      lastMessage: any;
      senderId: string;
    }) => {
      console.log("[Socket] dmListUpdated:", payload);

      queryClient.setQueryData<DirectChatRoom[]>(["dm-rooms"], (oldRooms) => {
        if (!oldRooms) return [];

        return oldRooms.map((room) => {
          if (room.id === payload.roomId) {
            const isFromOpponent = payload.senderId !== myInfo.id;
            return {
              ...room,
              lastMessage: payload.lastMessage,
              hasUnread: isFromOpponent ? true : room.hasUnread,
            };
          }
          return room;
        });
      });
    };

    if (socket.connected) {
      socket.emit("joinUserRoom", { userId: myInfo.id });
    }

    socket.on("connect", handleConnect);
    socket.on("dmListUpdated", handleDmListUpdate);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("dmListUpdated", handleDmListUpdate);
    };
  }, [myInfo?.id, queryClient]);

  /////////////////////////////////////////////////////////////////////////

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.headerTitle}</Text>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => setIsModalVisible(true)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={24}
            color={Colors.green}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={myDMRooms}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <PendingRequestsSection
              pendingRequests={pendingRequests}
              t={t}
              renderAvatar={renderAvatar}
              onAccept={acceptDmMutate}
              onReject={rejectDmMutate}
              styles={styles}
            />
            <View style={[styles.sectionHeader, { marginTop: 24 }]}>
              <Text style={styles.sectionTitle}>
                {t.roomsHeader(myDMRooms.length)}
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <DMRoomItem
            item={item}
            styles={styles}
            renderAvatar={renderAvatar}
            onPressItem={() => handlePressDmRoom(item)}
            onLongPressItem={handleLeaveRoom}
            lang={currentLang}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>{t.emptyRooms}</Text>
          </View>
        }
      />

      <SendDmModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        targetNickname={targetNickname}
        setTargetNickname={setTargetNickname}
        onSubmit={handleSendDmRequest}
        t={t}
        styles={styles}
      />
    </SafeAreaView>
  );
}

/////////////////////////////////////////////////////////////////////////

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090B",
    paddingBottom: -50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border || "#E9ECEF",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.green,
    fontStyle: "italic",
    letterSpacing: -0.5,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.card || "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  timeText: {
    fontSize: 12,
    color: "#8E8E93",
    alignSelf: "flex-start",
    marginTop: 2,
  },
  listContent: {
    padding: 16,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text || "#212529",
  },

  nickname: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text || "#212529",
  },
  lastMessage: {
    fontSize: 13,
    color: "#8E8E93",
    marginTop: Platform.OS === "ios" ? 6 : 2,
  },
  actionGroup: {
    flexDirection: "row",
    gap: 8,
  },
  btnAccept: {
    backgroundColor: Colors.green,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnAcceptText: {
    color: Colors.background,
    fontSize: 13,
    fontWeight: "600",
  },
  btnReject: {
    backgroundColor: Colors.red,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnRejectText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  emptyCard: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.card || "#FFFFFF",
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#8E8E93",
  },
  avatarContainer: {
    position: "relative",
  },
  badgeContainer: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#FF3B30",
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  dotBadge: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF3B30",
  },
  unreadMessageText: {
    fontWeight: "600",
    color: "#8E8E93",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text || "#212529",
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.tabIconDefault || "#888",
    marginBottom: 18,
    textAlign: "center",
  },
  modalInput: {
    flexDirection: "row",
    backgroundColor: "#2C2C2E",
    height: 42,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#FFF",
    fontSize: 15,
    marginBottom: 20,
  },
  modalButtonRow: {
    flexDirection: "row",
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: "#F1F1F1",
  },
  cancelBtnText: {
    color: "#333",
    fontWeight: "bold",
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: Colors.green,
  },
  submitBtnText: {
    color: Colors.card || "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
});
