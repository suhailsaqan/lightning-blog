import { AuthorContent } from "../lib/authors";

type Props = {
  author: string;
};
export default function Author({ author }: Props) {
  return (
    <>
      <span>{author}</span>
      <style jsx>
        {`
          span {
            color: #9b9b9b;
          }
        `}
      </style>
    </>
  );
}
