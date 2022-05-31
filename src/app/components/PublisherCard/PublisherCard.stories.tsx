import PublisherCard, { Props } from "./";
import { Story } from "@storybook/react/types-6-0";

const Template: Story<Props> = (args) => <PublisherCard {...args} />;

export const Default = Template.bind({});

Default.args = {
  title: "The Biz with John Carvalho",
  image: "https://picsum.photos/id/39/400/400",
  url: "https://bitcoin.org",
};

const metadata = {
  title: "Components/PublisherCard",
  component: PublisherCard,
};

export default metadata;
