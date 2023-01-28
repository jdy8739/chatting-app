# chatting-app

해당 프로젝트는 Next.JS, Sptingboot, WebSocket 프레임워크인 Stomp.JS 등으로 제작한 실시간 채팅 서비스입니다.

프론트개발 도구로써 Next.JS를 선택한 이유는 다음과 같습니다.

개인적으로 프론트개발에대한 지식을 찾아보던 중, 최근에는 일반적인 React.JS가 해결할 수 없는 크롤링을 통한 사용자 노출, 즉 SEO에대한 이슈가 많다는것을 알 수 있었습니다.
뿐만아니라 일반 React.JS의 방식은 라우팅에 따른 알맞은 컴포넌트를 먼저 사용자에게 보여주고 필요한 정보를 api서버에서 fetch하여 dom에 반영하기때문에 로딩 표시, 또는 변화하는 페이지에 부정적인 사용자 경험이 발생할 수 있고, 이를 해결하기위해 기존의 정적 html을 제공하는 서버처럼 완성된 html파일을 제공하고자하는 React 프레임워크들이 개발되고 있음을 파악했습니다.

따라서 Gatsby, Next.JS 등의 다양한 프레임워크들이 개발되고 있다는 것을 알 수 있었으며, 그 중 가장 활발하게 사용되고있는 Next.JS를 사용해서 프로젝트를 제작해보고싶었기에 
이러한 서비스를 만들어보게되었습니다.

전반적인 socket 통신의 뼈대는, publish, subscribe 구조로 실시간 채팅서비스의 주요 기능인 개인 채팅방 생성 및 유지를 간편하게 할 수 있고
이진파일 전송, 그리고 소켓 통신 중 발생하는 다양한 이벤트들을 캐치해 핸들링 할 수 있도록 도와주는 프레임워크인 Stomp.JS를 활용하여
전체적인 브라우저, 서버간의 실시간 상호작용이 가능하도록 제작했습니다.

해당 사이트 안에서 사용자들은 비밀번호, 수용인원, 채팅 주제등을 세팅한 개인 채팅방을 생성할 수 있습니다.
구현하고자 한 UX적인 특성으로서는 가입, 로그인을 수행한 사용자들이 자신이 만든 채팅방을 드래그앤 드랍으로 해당 채팅방의 채팅 주제를 바꿀 수 있도록하였으며
선호하는 주제의 채팅방 테이블을 드래그앤 드랍 또는 클릭으로 페이지 상단에 고정할 수 있도록 구현해 사용자들의 편의를 고려했습니다.

채팅방 생성자들은 채팅방의 주제를 바꾸는것 외에도 비밀번호 설정, 수용인원, 채팅 삭제 등을 수행할 수 있으며 사용자의 ip를 추출할 수 있는 외부 api사이트인 ipdata를 활용하여
특정 사용자의 강퇴, 강퇴 철회등을 수행할 수 있도록 구현하였습니다.
물론 지금까지 서술한 기능들은 socket 통신으로 실시간 모든 사용자들에게 반영이 되도록 하였으며, 
채팅방 리스트 로비 페이지에서는 각 채팅방의 비밀번호 설정 여부, 현재 참여 인원등을 실시간으로 파악할 수 있도록 구현하였습니다.

위의 기능들은 로그인 후에 서버에서 제공하는 access토큰, refresh토큰으로 인가정보를 파악하여 올바른 권한을 가진 사용자의 요청에만 실행될 수 있도록 구현하였으며,
해당 토큰들은 브라우저의 cookie에 저장되고 15 분마다 access토큰이 만료되어 refresh토큰을 재요청하도록 axios-interceptor를 구현하였습니다.

백엔드에서는 jpa와 jdbc template을 사용해 백엔드 비즈니스로직들이 mysql 데이터베이스와 트랜잭션을 수행할 수 있도록 하였으며,
사용자들이 채팅방을 생성할 때마다 jdbc template으로 동적 테이블 생성이 가능하도록 하여 각 채팅방마다 각각의 db 테이블을 가질 수 있도록 하였습니다.

채팅방 내에서 사용자들은 텍스트 데이터뿐만아니라 Stomp.JS에서 지원하는 이진데이터 전송기능을 활용하여 사진을 전송 및 저장할 수 있도록 구현하였으며
이 사진 파일들 및 사용자의 프로필 사진들은 aws  가상 리눅스 서버의 디렉토리에 저장되도록 구현했습니다.

이 서비스의 기능들은 밑의 링크에서 체험, 확인해보실 수 있습니다.

http://13.124.95.209/

감사합니다.

