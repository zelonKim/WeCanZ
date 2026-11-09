import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface PendingRequestsSectionProps {
  pendingRequests: any[];
  t: any;
  renderAvatar: (uri?: string) => React.ReactNode;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  styles: any;
}

export const PendingRequestsSection = ({
  pendingRequests,
  t,
  renderAvatar,
  onAccept,
  onReject,
  styles,
}: PendingRequestsSectionProps) => {
  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {t.pendingHeader(pendingRequests.length)}
        </Text>
      </View>

      {pendingRequests.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>{t.emptyPending}</Text>
        </View>
      ) : (
        pendingRequests.map((req) => {
          const requester = req.sender || req.user1;

          return (
            <View key={req.id} style={styles.card}>
              <View style={styles.userInfo}>
                {renderAvatar(requester?.profileImage)}
                <Text style={styles.nickname}>{requester?.nickname || ""}</Text>
              </View>

              <View style={styles.actionGroup}>
                <TouchableOpacity
                  style={styles.btnAccept}
                  onPress={() => onAccept(req.id)}
                >
                  <Text style={styles.btnAcceptText}>{t.accept}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnReject}
                  onPress={() => onReject(req.id)}
                >
                  <Text style={styles.btnRejectText}>{t.reject}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
};
