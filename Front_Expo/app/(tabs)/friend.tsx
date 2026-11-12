import { getMyFriends } from "@/api/friend/getMyFriends";
import { getPendingFriendRequests } from "@/api/friend/getPendingFriendRequests";
import { getBlockedUsers } from "@/api/user/getBlockedUsers";
import { searchUserByNickname } from "@/api/user/searchUserByNickname";
import { AddFriendModal } from "@/components/AddFriendModal";
import { BlockManagementModal } from "@/components/BlockManagementModal";
import { FriendItemRow } from "@/components/FriendItemRow";
import { PendingRequestsSection } from "@/components/PendingRequestsSection";
import { renderAvatar } from "@/components/renderAvatar";
import Colors from "@/constants/Colors";
import { useAcceptFriendMutation } from "@/hooks/friend/useAcceptFriendMutation";
import { useBlockUserMutation } from "@/hooks/friend/useBlockUserMutation";
import { useRejectFriendMutation } from "@/hooks/friend/useRejectFriendMutation";
import { useRequestFriendDmMutation } from "@/hooks/friend/useRequestFriendDmMutation";
import { useRequestFriendMutation } from "@/hooks/friend/useRequestFriendMutation";
import { useUnblockUserMutation } from "@/hooks/friend/useUnblockUserMutation";
import { useFriendLanguage } from "@/hooks/Languages/useFriendLanguage";
import { FriendItem } from "@/types/friend/FriendItem";
import { FriendshipRequest } from "@/types/friend/FriendshipRequest";
import { BlockedUserItem } from "@/types/user/BlockedUserItem";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FriendScreen() {
  const { t } = useFriendLanguage();

  const [isBlockModalVisible, setIsBlockModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [friendNickname, setFriendNickname] = useState("");
  const [blockNickname, setBlockNickname] = useState("");

  const {
    data: pendingRequests = [],
    isPending: isWatingPending,
    refetch: refetchPending,
  } = useQuery<FriendshipRequest[]>({
    queryKey: ["friend-requests-pending"],
    queryFn: getPendingFriendRequests,
  });

  /////////////////////////////////////////////////////////////////////////

  const {
    data: myFriends = [],
    isPending: isFriendsPending,
    refetch: refetchFriends,
  } = useQuery<FriendItem[]>({
    queryKey: ["my-friends"],
    queryFn: getMyFriends,
  });

  /////////////////////////////////////////////////////////////////////////

  const {
    data: blockedUsers = [],
    isPending: isBlockedPending,
    refetch: refetchBlocked,
  } = useQuery<BlockedUserItem[]>({
    queryKey: ["blocked-users"],
    queryFn: getBlockedUsers,
    enabled: isBlockModalVisible,
  });

  /////////////////////////////////////////////////////////////////////////

  const isRefreshing = isWatingPending || isFriendsPending;

  const onRefresh = () => {
    refetchPending();
    refetchFriends();
  };

  /////////////////////////////////////////////////////////////////////////

  const { mutate: requestFriendMutate } = useRequestFriendMutation(t, () => {
    setIsAddModalVisible(false);
    setFriendNickname("");
  });

  const handleSendFriendRequest = async () => {
    if (!friendNickname.trim()) {
      Alert.alert(t.alerts.notice, t.alerts.emptyNickname);
      return;
    }
    try {
      const userData = await searchUserByNickname(friendNickname.trim());
      requestFriendMutate(userData.id);
    } catch (error: any) {
      const errorMessage = t.alerts.searchFail;
      Alert.alert(t.alerts.notice, errorMessage);
    }
  };

  /////////////////////////////////////////////////////////////////////////

  const { mutate: blockUserMutate } = useBlockUserMutation(() => {
    setBlockNickname("");
  });

  const handleBlockByNickname = async () => {
    if (!blockNickname.trim()) {
      Alert.alert(t.alerts.notice, t.alerts.emptyBlockNickname);
      return;
    }
    try {
      const userData = await searchUserByNickname(blockNickname.trim());
      blockUserMutate(userData.id);
    } catch (error: any) {
      Alert.alert(t.alerts.notice, t.alerts.searchFail);
    }
  };

  /////////////////////////////////////////////////////////////////////////

  const { mutate: acceptFriendMutate } = useAcceptFriendMutation(t);

  const { mutate: rejectFriendMutate } = useRejectFriendMutation(t);

  const { mutate: requestFriendDmMutate } = useRequestFriendDmMutation(t);

  const { mutate: unblockMutate } = useUnblockUserMutation(t);

  ////////////////////////////////////////////////////////////////////////

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.headerTitle}</Text>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setIsAddModalVisible(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="person-add-outline"
              size={24}
              color={Colors.green}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setIsBlockModalVisible(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="person-remove-outline"
              size={24}
              color={Colors.red}
            />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={myFriends}
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
              onAccept={acceptFriendMutate}
              onReject={rejectFriendMutate}
              styles={styles}
            />
            <View style={[styles.sectionHeader, { marginTop: 24 }]}>
              <Text style={styles.sectionTitle}>
                {t.roomsHeader(myFriends.length)}
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <FriendItemRow
            item={item}
            styles={styles}
            Colors={Colors}
            t={t}
            renderAvatar={renderAvatar}
            onRequestDm={(targetUserId, friend) =>
              requestFriendDmMutate({ targetUserId, friend })
            }
            onBlockUser={unblockMutate}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>{t.emptyFriends}</Text>
          </View>
        }
      />

      <AddFriendModal
        visible={isAddModalVisible}
        onClose={() => {
          setIsAddModalVisible(false);
          setFriendNickname("");
        }}
        friendNickname={friendNickname}
        setFriendNickname={setFriendNickname}
        onSubmit={handleSendFriendRequest}
        t={t}
        styles={styles}
      />

      <BlockManagementModal
        visible={isBlockModalVisible}
        onClose={() => setIsBlockModalVisible(false)}
        blockNickname={blockNickname}
        setBlockNickname={setBlockNickname}
        onBlockSubmit={handleBlockByNickname}
        blockedUsers={blockedUsers}
        isBlockedLoading={isBlockedPending}
        onRefreshBlocked={refetchBlocked}
        onUnblock={(targetUserId) => unblockMutate(targetUserId)}
        renderAvatar={renderAvatar}
        Colors={Colors}
        t={t}
        styles={styles}
      />
    </SafeAreaView>
  );
}

///////////////////////////////////////////////////////////////////////////////////////////////

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
    borderBottomColor: Colors.border,
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
  listContent: {
    padding: 16,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.card || "#FFFFFF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    width: 160,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  nickname: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
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
  btnUnblock: {
    backgroundColor: Colors.tabIconDefault,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnUnblockText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyCard: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#8E8E93",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  modalContentCard: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 16,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  modalListContent: {
    paddingVertical: 4,
  },

  directBlockContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  directBlockInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.card,
    height: 42,
  },
  directBlockBtn: {
    backgroundColor: Colors.red,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  directBlockBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border || "#E9ECEF",
    marginVertical: 12,
  },
  subListTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text || "#212529",
    marginBottom: 8,
  },

  actionIconGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  dmActionBtn: {
    padding: 6,
    backgroundColor: Colors.green,
    borderRadius: 12,
  },
  blockActionBtn: {
    padding: 6,
    backgroundColor: Colors.red,
    borderRadius: 12,
  },

  addModalOverlay: {
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
  addModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.tabIconDefault,
    marginBottom: 18,
    textAlign: "center",
  },
  modalInput: {
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
    backgroundColor: "#f1f1f1",
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
    color: Colors.card,
    fontWeight: "bold",
    fontSize: 14,
  },
});
