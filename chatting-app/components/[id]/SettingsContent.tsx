import { useState } from "react";
import { useForm } from "react-hook-form";
import { IRoomSettings } from "../../utils/interfaces";
import { requestWithTokenAxios } from "../../utils/axios";

function SettingsContent({
  roomId,
  setIsModalShown,
}: {
  roomId: number;
  setIsModalShown: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [settingOption, setSettingOption] = useState(true);
  const [usePassword, setUsePassword] = useState(false);
  const {
    getValues,
    setValue,
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<IRoomSettings>({
    defaultValues: { password: "", pwRequired: false, limitation: 15 },
  });
  const [isRendered, setIsReRendered] = useState(false);
  const showNowLimitValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("limitation", +e.currentTarget.value);
    setIsReRendered(!isRendered);
  };
  const submitSettingsChange = async ({
    password,
    pwRequired,
    limitation,
  }: IRoomSettings) => {
    const { status } = await requestWithTokenAxios.put(`/room/settings`, {
      settingOption,
      pwRequired,
      value: settingOption ? password : limitation,
      roomId,
    });
    if (status === 200) setIsModalShown(false);
  };
  return (
    <>
      <br></br>
      <div>
        <button
          onClick={() => setSettingOption(true)}
          className={`${settingOption ? "chosen" : "normal"}`}
        >
          password
        </button>
        &emsp;
        <button
          onClick={() => setSettingOption(false)}
          className={`${!settingOption ? "chosen" : "normal"}`}
        >
          capacity
        </button>
      </div>
      <form onSubmit={handleSubmit(submitSettingsChange)}>
        {settingOption ? (
          <div>
            <p className="title">Set the room password.</p>
            <span className="small">use password</span>
            <input
              type="checkbox"
              {...register("pwRequired", {
                onChange: () => setUsePassword(!usePassword),
              })}
            />
            <input
              className="input-box"
              type="password"
              maxLength={15}
              {...register("password", {
                maxLength: {
                  value: 15,
                  message: "Password length cannot exceeds 15.",
                },
              })}
              placeholder="Input new password."
              disabled={!usePassword}
            />
            <div className="error-message">{errors.password?.message}</div>
          </div>
        ) : (
          <div>
            <p>Rearrange the room capacity.</p>
            <input
              className="input-box"
              type="range"
              min={2}
              max={30}
              {...register("limitation", {
                min: {
                  value: 2,
                  message: "The room capacity is 2 at least.",
                },
                max: {
                  value: 30,
                  message: "The room capacity cannot exceeds 30.",
                },
                onChange: showNowLimitValue,
              })}
            />
            &emsp;
            <div className="error-message">{errors.limitation?.message}</div>
            <span className="small">capacity {getValues("limitation")}</span>
          </div>
        )}
        <button type="submit" className="normal">
          apply
        </button>
      </form>
      <style jsx>{`
        p,
        span {
          color: grey;
        }
        .small {
          font-size: 12px;
        }
        .normal {
          border: rgb(0, 219, 146);
          color: rgb(0, 219, 146);
          background-color: rgb(0, 219, 146, 0.3);
          border: 1px solid rgb(0, 219, 146);
        }
        .normal:hover {
          color: white;
          background-color: rgb(0, 219, 146);
        }
        .chosen {
          border: rgb(239, 158, 66);
          color: rgb(239, 158, 66);
          background-color: rgb(239, 158, 66, 0.3);
          border: 1px solid rgb(239, 158, 66);
        }
        .chosen:hover {
          color: white;
          background-color: rgb(239, 158, 66);
        }
      `}</style>
    </>
  );
}

export default SettingsContent;
