import { default as BoringAvatar } from "boring-avatars";

type Props = {
  name: string;
  size?: number | string;
};

const Avatar = (props: Props) => {
  return <BoringAvatar name={props.name} size={props.size} variant="beam" />;
};

export default Avatar;
