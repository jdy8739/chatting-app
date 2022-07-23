import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Seo from "../../components/commons/Seo";
import { clearPreviousRoomId } from "../../utils/utils";

interface ISignUpForm {
	id: string,
    nickName: string,
	password: string,
	passwordCheck: string,
}

const ID_REGEX = /^[a-zA-Z0-9]/;

const PW_REGEX = /^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹])/;

function SingUp() {
    const [isRendered, setIsRendered] = useState(false);
    const {
		register,
		handleSubmit,
		formState: { errors },
		setError,
	} = useForm<ISignUpForm>();
    const handleSignUpFormSubmit = (data: ISignUpForm) => {
        if (data.password !== data.passwordCheck) {
			setError(
                'passwordCheck',
				{ message: 'password and check are not identical.' },
				{ shouldFocus: true },
			);
        } else {
            
        }
        
    }
    useEffect(() => {
        setIsRendered(true);
        clearPreviousRoomId();
    }, [])
    return (
        <div className="all">
            <Seo title="Chato SignUp"></Seo>
            <form
                className="submit-form"
                style={{ height: '422px' }}
                onSubmit={handleSubmit(handleSignUpFormSubmit)}
            >
                <h4 className="title">Welcome to Chato :)</h4>
                <div className="form-body">
                    <label htmlFor="id">
                        <span className="item">input your id</span>
                        <input
                            className="input-box"
                            id="id"
                            placeholder="id"
                            {...register('id', {
                                required: 'ID is essential!',
                                pattern: {
                                    value: ID_REGEX,
                                    message: 'Id must include english and numbers only.'
                                },
                                minLength: {
                                    value: 8,
                                    message: 'Id must be longer than 8.',
                                },
                                maxLength: {
                                    value: 15,
                                    message: 'Id must be shorter than 15.',
                                }
                            })}
                        />
                    </label>
                    <div className="error-message">{errors.id?.message}</div>
                    <label htmlFor="nick-name">
                        <span className="item">nick-name</span>
                        <input
                            className="input-box"
                            id="nick-name"
                            placeholder="user nick-name"
                            {...register('nickName', {
                                required: 'Nick name is essential!',
                                minLength: {
                                    value: 1,
                                    message: 'Nick name must be longer than 1.',
                                },
                                maxLength: {
                                    value: 15,
                                    message: 'Nick name must be shorter than 20.',
                                }
                            })}
                        />
                    </label>
                    <div className="error-message">{errors.nickName?.message}</div>
                    <label htmlFor="password">
                        <span className="item">password</span>
                        <input
                            className="input-box"
                            id="password"
                            type="password"
                            placeholder="password"
                            {...register('password', {
                                required: 'Password is essential!',
                                validate: {
                                    regex: value => 
                                    PW_REGEX.test(value) ? true : 'Password must include special chars.',
                                },
                                minLength: {
                                    value: 12,
                                    message: 'Password must be longer than 12.',
                                },
                                maxLength: {
                                    value: 20,
                                    message: 'Password must be shorter than 20.',
                                }
                            })}
                        />
                    </label>
                    <div className="error-message">{errors.password?.message}</div>
                    <label htmlFor="password-check">
                        <span className="item">password check</span>
                        <input
                            className="input-box"
                            id="password-check"
                            type="password"
                            placeholder="password-check"
                            {...register('passwordCheck', {
                                required: 'password check is essential!',
                                minLength: {
                                    value: 8,
                                    message: 'Password check must be longer than 12.',
                                },
                                maxLength: {
                                    value: 15,
                                    message: 'Password check must be shorter than 20.',
                                }
                            })}
                        />
                    </label>
                    <div className="error-message">{errors.passwordCheck?.message}</div>
                </div>
                <div style={{ marginTop: '45px' }}></div>
                <button 
                    className="submit-btn"
                >submit</button>
            </form>
            <style>{`
                input {
                    width: 250px;
                }
                .error-message {
                    height: 18px;
                    color: orange;
                    font-size: 13px;
                }
                .all {
                    transition: all 1s;
                    opacity: ${ isRendered ? '1' : '0' };
                    transform: translateY(${ isRendered ? '0px' : '80px' });
                }
            `}</style>
        </div>
    );
}

export default SingUp;