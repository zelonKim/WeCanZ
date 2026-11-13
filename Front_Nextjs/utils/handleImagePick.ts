export const handleImagePick = (setSelectedImage: (uri: string) => void) => {
  if (typeof window === "undefined") return;

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      const file = target.files[0];

      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  input.click();
};
