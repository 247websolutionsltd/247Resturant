import Button from "@/components/button";
import Container from "@/components/custom-container";
import Input from "@/components/custom-input";
import Header from "@/components/header";
import { ThemedText } from "@/components/themed-text";
import { Card, Chip, DashedLine, DetailRow, IconBadge } from "@/components/ui";
import { Brand } from "@/constants/brand";
import { Radius, Spacing } from "@/constants/theme";
import { useCart } from "@/context/CartContext";
import { useOrders } from "@/context/OrdersContext";
import { BRANCHES } from "@/data/branches";
import { price } from "@/data/promos";
import { useTheme } from "@/hooks/use-theme";
import { formatMoney, plural } from "@/lib/format";
import { goReplace } from "@/lib/nav";
import { PAYMENT_METHODS, PaymentMethod } from "@/services/payments";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

type Mode = "delivery" | "pickup";

export default function Checkout() {
  const theme = useTheme();
  const { lines, raw, count, subtotal, promo, clear } = useCart();
  const { addresses, addAddress, placeOrder } = useOrders();

  const [mode, setMode] = useState<Mode>("delivery");
  const [addressId, setAddressId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("Home");
  const [newLine, setNewLine] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [branchId, setBranchId] = useState(BRANCHES[0].id);
  const [payment, setPayment] = useState<PaymentMethod>("card");
  const [note, setNote] = useState("");
  const [placing, setPlacing] = useState(false);

  // select the newest address by default, and open the form if there are none
  useEffect(() => {
    if (!addressId && addresses.length) setAddressId(addresses[0].id);
    if (addressId && !addresses.some((a) => a.id === addressId)) setAddressId(addresses[0]?.id ?? null);
  }, [addresses, addressId]);

  const { delivery, discount, total } = price(subtotal, mode, promo);
  const address = addresses.find((a) => a.id === addressId);
  const showForm = adding || addresses.length === 0;

  const saveAddress = async () => {
    setAddError(null);
    setSavingAddress(true);
    const res = await addAddress({ label: newLabel, line: newLine });
    setSavingAddress(false);
    if (!res.ok) return setAddError(res.error);
    setNewLine("");
    setAdding(false);
    setAddressId(res.id);
  };

  const place = async () => {
    if (placing) return;
    if (mode === "delivery" && !address) {
      Alert.alert("Where should we deliver?", "Add a delivery address to continue.");
      return;
    }
    setPlacing(true);
    const res = await placeOrder({
      lines: raw,
      mode,
      address: address ? { label: address.label, line: address.line } : undefined,
      branchId: mode === "pickup" ? branchId : undefined,
      payment,
      promoCode: promo?.code,
      note,
    });
    setPlacing(false);
    if (!res.ok) {
      Alert.alert("We couldn't place your order", res.error);
      return;
    }
    clear();
    goReplace(`/order/success?id=${res.id}`);
  };

  if (lines.length === 0) {
    return (
      <Container edges={["top", "bottom"]}>
        <Header title="Checkout" />
        <View style={{ padding: Spacing.four, alignItems: "center" }}>
          <ThemedText themeColor="textSecondary">Your basket is empty.</ThemedText>
          <Button title="Browse the menu" onPress={() => goReplace("/(tabs)/menu")} style={{ marginTop: Spacing.three, alignSelf: "stretch" }} />
        </View>
      </Container>
    );
  }

  const eta = Math.max(...lines.map((l) => l.item.prep));

  return (
    <Container edges={["top", "bottom"]}>
      <Header title="Checkout" />
      <View style={{ paddingHorizontal: Spacing.three }}>
        {/* mode */}
        <View style={{ flexDirection: "row", gap: Spacing.two + 2 }}>
          {(
            [
              { id: "delivery", label: "Delivery", sub: `~${eta + 20} min`, icon: "bicycle" },
              { id: "pickup", label: "Pickup", sub: `~${Math.max(eta, 15)} min`, icon: "storefront" },
            ] as const
          ).map((m) => {
            const on = mode === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                onPress={() => setMode(m.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                activeOpacity={0.85}
                style={{
                  flex: 1,
                  padding: Spacing.three,
                  borderRadius: Radius.lg,
                  backgroundColor: on ? theme.cta : theme.card,
                  borderWidth: 1.5,
                  borderColor: on ? theme.cta : theme.line,
                }}
              >
                <Ionicons name={m.icon} size={24} color={on ? "#FFF" : theme.accent} />
                <ThemedText type="bold" style={{ marginTop: Spacing.two, color: on ? "#FFF" : theme.text }}>{m.label}</ThemedText>
                <ThemedText type="caption" style={{ color: on ? "rgba(255,255,255,0.85)" : theme.textSecondary }}>{m.sub}</ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* where */}
        <ThemedText type="big" style={{ marginTop: Spacing.four, marginBottom: Spacing.two + 2 }}>
          {mode === "delivery" ? "Deliver to" : "Collect from"}
        </ThemedText>

        {mode === "delivery" ? (
          <>
            {addresses.map((a) => (
              <SelectRow key={a.id} icon={a.label.toLowerCase() === "work" ? "briefcase-outline" : "home-outline"} title={a.label} subtitle={a.line} selected={a.id === addressId} onPress={() => setAddressId(a.id)} />
            ))}
            {showForm ? (
              <Card style={{ marginTop: addresses.length ? Spacing.one : 0 }}>
                <ThemedText type="smallBold">New address</ThemedText>
                <View style={{ flexDirection: "row", gap: Spacing.two, marginTop: Spacing.two + 2 }}>
                  {["Home", "Work", "Other"].map((l) => (
                    <Chip key={l} label={l} selected={newLabel === l} onPress={() => setNewLabel(l)} />
                  ))}
                </View>
                <Input placeholder="House number, street, area" icon="location-outline" value={newLine} onChangeText={setNewLine} error={addError} />
                <View style={{ flexDirection: "row", gap: Spacing.two, marginTop: Spacing.one }}>
                  {addresses.length > 0 && <Button title="Cancel" variant="secondary" small onPress={() => setAdding(false)} style={{ flex: 1 }} />}
                  <Button title="Save address" small onPress={saveAddress} loading={savingAddress} style={{ flex: 1 }} />
                </View>
              </Card>
            ) : (
              <TouchableOpacity onPress={() => setAdding(true)} style={{ flexDirection: "row", alignItems: "center", paddingVertical: Spacing.two }}>
                <Ionicons name="add-circle" size={20} color={theme.accent} />
                <ThemedText type="smallBold" style={{ color: theme.accent, marginLeft: Spacing.two }}>Add a new address</ThemedText>
              </TouchableOpacity>
            )}
          </>
        ) : (
          BRANCHES.map((b) => (
            <SelectRow key={b.id} icon="storefront-outline" title={b.name} subtitle={`${b.address}\n${b.hours} · ready in ~${b.pickupMins} min`} selected={b.id === branchId} onPress={() => setBranchId(b.id)} />
          ))
        )}

        {/* payment */}
        <ThemedText type="big" style={{ marginTop: Spacing.four, marginBottom: Spacing.two + 2 }}>Payment</ThemedText>
        {PAYMENT_METHODS.map((p) => (
          <SelectRow key={p.id} icon={p.icon} title={p.label} subtitle={p.desc(mode === "pickup")} selected={payment === p.id} onPress={() => setPayment(p.id)} />
        ))}

        {/* note */}
        <Input
          label={mode === "delivery" ? "Note for the rider (optional)" : "Note for the kitchen (optional)"}
          placeholder={mode === "delivery" ? "Gate code, landmark, call on arrival…" : "Anything we should know?"}
          desc
          value={note}
          onChangeText={setNote}
          maxLength={160}
        />

        {/* summary */}
        <Card style={{ marginTop: Spacing.three }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: Spacing.two }}>
            <Text style={{ fontSize: 18 }}>🧾</Text>
            <ThemedText type="bold" style={{ marginLeft: Spacing.two }}>Order summary</ThemedText>
            <ThemedText type="caption" themeColor="textSecondary" style={{ marginLeft: "auto" }}>{plural(count, "item")}</ThemedText>
          </View>
          {lines.map((l) => (
            <View key={l.key} style={{ flexDirection: "row", paddingVertical: 4 }}>
              <ThemedText type="small" style={{ width: 28, fontWeight: "800", color: theme.accent }}>{l.qty}×</ThemedText>
              <ThemedText type="small" style={{ flex: 1 }} numberOfLines={1}>{l.item.name}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">{formatMoney(l.total)}</ThemedText>
            </View>
          ))}
          <DashedLine style={{ marginVertical: Spacing.two + 2 }} />
          <DetailRow label="Subtotal" value={formatMoney(subtotal)} />
          {mode === "delivery" ? <DetailRow label="Delivery fee" value={delivery ? formatMoney(delivery) : "Free"} /> : null}
          {discount > 0 ? <DetailRow label={`Promo (${promo?.code})`} value={`-${formatMoney(discount)}`} accent /> : null}
          <DetailRow label="Total" value={formatMoney(total)} bold last />
          <ThemedText type="caption" themeColor="textSecondary" style={{ marginTop: Spacing.two }}>
            You'll earn {Math.floor(total * Brand.pointsPerNaira)} points with this order.
          </ThemedText>
        </Card>

        <Button title={`Place order · ${formatMoney(total)}`} icon="checkmark" onPress={place} loading={placing} style={{ marginTop: Spacing.four }} />
        <ThemedText type="caption" themeColor="inkSoft" style={{ textAlign: "center", marginTop: Spacing.three }}>
          By placing your order you agree to {Brand.fullName}'s terms.
        </ThemedText>
      </View>
    </Container>
  );
}

function SelectRow({ icon, title, subtitle, selected, onPress }: { icon: React.ComponentProps<typeof IconBadge>["icon"]; title: string; subtitle: string; selected: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: Spacing.three - 2,
        marginBottom: Spacing.two,
        borderRadius: Radius.md,
        backgroundColor: selected ? theme.accentSurface : theme.card,
        borderWidth: 1.5,
        borderColor: selected ? theme.accent : theme.line,
      }}
    >
      <IconBadge icon={icon} size={40} bg={selected ? theme.card : theme.accentSurface} />
      <View style={{ flex: 1, marginLeft: Spacing.three - 2 }}>
        <ThemedText type="smallBold">{title}</ThemedText>
        <ThemedText type="caption" themeColor="textSecondary" style={{ marginTop: 2, lineHeight: 16 }}>{subtitle}</ThemedText>
      </View>
      <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: selected ? theme.cta : theme.controlOff, alignItems: "center", justifyContent: "center" }}>
        {selected ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.cta }} /> : null}
      </View>
    </TouchableOpacity>
  );
}
