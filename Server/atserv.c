#define _USE_BSD
#include <sys/types.h>
#include <sys/signal.h>
#include <sys/socket.h>
#include <sys/time.h>
#include <sys/resource.h>
#include <sys/wait.h>
#include <sys/errno.h>
#include <netinet/in.h>
#include <unistd.h>
#include <stdarg.h>

#include <stdlib.h>
#include <stdio.h>
#include <string.h>

#include <sys/types.h>
#include <sys/socket.h>
#include <netdb.h>
#include <arpa/inet.h>


#define QLEN 32 	/* Максимальная длина очереди соединений */
#define BUFSIZE 4096

void reaper(int);
int TCPechod(int fd);
int errexit(const char *format, ...);
int passiveTCP(const char *service, int qlen);
int passivesock(const char *service, const char *transport,int qlen);
unsigned short	portbase = 0;	/* port base, for non-root servers	*/


/*-----------------------
 * Главная процедура
 *-----------------------
 */
int main(int argc, char *argv[]) {

char *service = "10000"; 	/* Имя службы или номер порта */
struct sockaddr_in fsin; 	/* Адрес клиента */
unsigned int alen; 		/* Длина адреса клиента */
int msock; 			/* Ведущий сокет сервера */
int ssock; 			/* Ведомый сокет сервера */

/* printf("Hello world !\n");*/
/* return(0);*/

msock = passiveTCP(service, QLEN);
/*printf("Sock:%n\n",msock);*/

(void) signal(SIGCHLD, reaper);

while (1) {
alen = sizeof(fsin);
ssock = accept(msock, (struct sockaddr *)&fsin, &alen);
if (ssock <0) {
	if (errno == EINTR)
	continue;
	errexit("accept: %s\n", strerror(errno));
}

switch (fork()) {
case 0: 		/* Дочерний процесс */
    printf("Дочерний\n");
    (void) close(msock);
    exit(TCPechod(ssock));
default: 		/* Родительский процесс */
    printf("Родительский\n");
    (void) close(ssock);
    break;
case -1:
    errexit("fork: %s\n", strerror(errno));
	   }
    }
}

/*--------------------------------------------------------------------------- 
 * Процедура TCPechod - выполняет эхо-повтор данных до обнаружения признака
 * конца файла
 *---------------------------------------------------------------------------
 */


int TCPechod (int fd)
{
char buf[BUFSIZ];
int cc;

while (cc = read(fd, buf, sizeof buf)) {
if (cc <0) errexit("echo read: %s\n", strerror(errno));
/*printf("Length:%d\n",cc);*/
printf("%s",buf);
if (buf[cc]=='q') break;
}
return 0;
}

/*--------------------------------------------------------------------------- 
 * Процедура reaper - убирает записи дочерних процессов-зомби из системных
 * таблиц
 *---------------------------------------------------------------------------
 */

void reaper(int sig)
{
int status;
while (wait3(&status, WNOHANG, (struct rusage *)0)>= 0)
/* Пустое тело цикла */;
}

/*---------------------------------------------------------------------------
 * Процедура errexit - выводит сообщение об ошибке и завершает работу
 *---------------------------------------------------------------------------
 */
int errexit(const char *format, ...)
{
va_list args;
va_start(args, format);
vfprintf(stderr, format, args);
va_end(args);
exit(1);
}

/*---------------------------------------------------------------------------
 * Процедура passiveTCP - создает пассивный сокет для использования
 * в сервере TCP
 *---------------------------------------------------------------------------
 */
int passiveTCP(const char *service, int qlen)
/*
 * Параметры:
 * service - служба, связанная с требуемым портом
 * qlen - максимальная длина очереди запросов сервера
 */
{
return passivesock(service, "tcp", qlen);
}


/*------------------------------------------------------------------------
 * passivesock - allocate & bind a server socket using TCP or UDP
 *------------------------------------------------------------------------
 */
int
passivesock(const char *service, const char *transport, int qlen)
/*
 * Arguments:
 *      service   - service associated with the desired port
 *      transport - transport protocol to use ("tcp" or "udp")
 *      qlen      - maximum server request queue length
 */
{
    struct servent	*pse;	/* pointer to service information entry	*/
    struct protoent *ppe;	/* pointer to protocol information entry*/
    struct sockaddr_in sin;	/* an Internet endpoint address		*/
    int	s, type;	/* socket descriptor and socket type	*/

    memset(&sin, 0, sizeof(sin));
    sin.sin_family = AF_INET;
    sin.sin_addr.s_addr = INADDR_ANY;

    /* Map service name to port number */
    if ( pse = getservbyname(service, transport) )
	sin.sin_port = htons(ntohs((unsigned short)pse->s_port)
	    + portbase);
    else if ((sin.sin_port=htons((unsigned short)atoi(service))) == 0)
	errexit("can't get \"%s\" service entry\n", service);

    /* Map protocol name to protocol number */
    if ( (ppe = getprotobyname(transport)) == 0)
	errexit("can't get \"%s\" protocol entry\n", transport);

    /* Use protocol to choose a socket type */
    if (strcmp(transport, "udp") == 0)
	type = SOCK_DGRAM;
    else
	type = SOCK_STREAM;

    /* Allocate a socket */
    s = socket(PF_INET, type, ppe->p_proto);
    if (s < 0)
	errexit("can't create socket: %s\n", strerror(errno));

    /* Bind the socket */
    if (bind(s, (struct sockaddr *)&sin, sizeof(sin)) < 0)
	errexit("can't bind to %s port: %s\n", service,
	    strerror(errno));
    if (type == SOCK_STREAM && listen(s, qlen) < 0)
	errexit("can't listen on %s port: %s\n", service,
	    strerror(errno));
    return s;
}