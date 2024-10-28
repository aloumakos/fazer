import React from "react";

const ImageCard = (props: {
  image: string;
  base64: boolean;
  caption?: string;
}) => {
  let image;
  if (props.base64 == true) {
    image = <img src={"data:image/jpeg;base64," + props.image} alt="car!" />;
  } else {
    image = <img src={props.image} alt="car!" />;
  }
  return (
    <div className="justify-center items-center space-x-64">
      <div className="card w-64 glass scale-75 hover:scale-100 ease-in duration-200">
        <figure>{image}</figure>
        <div className="opacity-0 hover:opacity-100 duration-300 absolute inset-0 z-10 flex justify-center items-end text-4xl text-white font-semibold">
          {props.caption}
        </div>
      </div>
    </div>
  );
};

export default ImageCard;
