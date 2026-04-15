package common

type Response struct {
	Status	int			`json:"-"`
	Code    int         `json:"code"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data"`
	Info    string      `json:"info,omitempty"`
}

func MethodNotAllowed() Response {
	return Response{
		Status: 400,
		Code:    400,
		Message: "The method is not supported",
		Data: nil,
	}
}

func NotFound() Response {
	return Response{
		Status: 404,
		Code:    404,
		Message: "The endpoint is not found",
		Data: nil,
	}
}

func Success(data ...interface{}) Response {
	return Response{
		Status: 200,
		Code:    1,
		Message: "SUCCESS",
		Data:    data,
	}
}

func InnerError() Response {
	return Response{
		Status: 500,
		Code:    4,
		Message: "INNER ERROR",
		Data: nil,
	}
}

func FileNotFound() Response {
	return Response{
		Status: 404,
		Code:    404,
		Message: "The file you tried to access wasn't found",
		Data: nil,
	}
}

func FileFound(file interface{}) Response {
	return Response{
		Status: 200,
		Code:    200,
		Data:    file,
	}
}

func DispatchAuthFailed() Response {
	return Response{
		Status: 401,
		Code: 1001,
		Info: "Invalid userId or token",
	}
}

func RequiresGameAuthParams() Response {
	return Response{
		Status: 400,
		Code:    400,
		Message: "userId and access-token are expected",
	}
}

func ProfileNotExists() Response {
	return Response{
		Status: 200,
		Code:    1002,
		Message: "The profile doesn't exist",
		Data: nil,
	}
}
