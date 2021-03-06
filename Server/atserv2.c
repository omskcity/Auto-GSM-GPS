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


#include <unistd.h>
#include <pthread.h>

//#include <sys/unp.h>

#define	QLEN		32	/* maximum connection queue length	*/
#define	BUFSIZE		4096
//#define MAXLINE
#define	INTERVAL	5	/* secs */

struct {
	pthread_mutex_t	st_mutex;
	unsigned int	st_concount;
	unsigned int	st_contotal;
	unsigned long	st_contime;
	unsigned long	st_bytecount;
} stats;

void	prstats(void);
int	TCPechod(int fd);
int	errexit(const char *format, ...);
int	passiveTCP(const char *service, int qlen);
unsigned short	portbase = 0;	/* port base, for non-root servers	*/


/*------------------------------------------------------------------------
 * main - Concurrent TCP server for ECHO service
 *------------------------------------------------------------------------
 */
int main(int argc, char *argv[])
{
	pthread_t	th;
	pthread_attr_t	ta;
	/*char	*service = "echo";	/* service name or port number	*/
	char	*service = "10000";
	struct	sockaddr_in fsin,cli;	/* the address of a client	*/
	
	unsigned int	alen,clen;		/* length of client's address	*/
	int	msock;					/* master server socket		*/
	int	ssock;					/* slave server socket		*/
	char				buff[BUFSIZE];


	/*switch (argc) {
	case	1:
		break;
	case	2:
		service = argv[1];
		break;
	default:
		errexit("usage: TCPechod [port]\n");
	}*/

	msock = passiveTCP(service, QLEN);

	(void) pthread_attr_init(&ta);
	(void) pthread_attr_setdetachstate(&ta, PTHREAD_CREATE_DETACHED);
	(void) pthread_mutex_init(&stats.st_mutex, 0);

	if (pthread_create(&th, &ta, (void * (*)(void *))prstats, 0) < 0)
		errexit("pthread_create(prstats): %s\n", strerror(errno));

	while (1) {
		alen = sizeof(fsin);
		clen = sizeof(cli);
		//ssock = accept(msock, (struct sockaddr *)&fsin, &alen);
		ssock = accept(msock, (struct sockaddr *)&cli, &clen);
		//fsin.sin_addr.s_addr=htonl(fsin.sin_addr.s_addr);
		//inet_ntoa(adr_inet.sin_addr)
		//(struct sockaddr *)&fsin, &alen)
		//printf("connection from %d, port %d\n",
		//	   Inet_ntop(AF_INET, &cli.sin_addr, buff, sizeof(buff)), ntohs(cli.sin_port));
		//getpeername(ssock,(struct sockaddr *)&fsin, &alen);
		
		//(void) printf("%d\n", getpeername(ssock,(struct sockaddr *)&nm, &nlen));
		//(void) printf("%s\n", inet_ntoa(addr.sin_addr));
		//(void) printf("%lu\n", fsin.sin_addr.s_addr);
		//fsin.sa_data sin_addr
		//inet_ntoa((struct sockaddr *)&fsin.sa_data)
		if (ssock < 0) {
			if (errno == EINTR)
				continue;
			errexit("accept: %s\n", strerror(errno));
		}
		if (pthread_create(&th, &ta, (void * (*)(void *))TCPechod, (void *)ssock) < 0)
			errexit("pthread_create: %s\n", strerror(errno));
	}
}

/*------------------------------------------------------------------------
 * TCPechod - echo data until end of file
 *------------------------------------------------------------------------
 */
int TCPechod(int fd)
{
	time_t	start;
	char	buf[BUFSIZ];
	int	cc;

	start = time(0);
	(void) pthread_mutex_lock(&stats.st_mutex);
	stats.st_concount++;
	(void) pthread_mutex_unlock(&stats.st_mutex);
	while (cc = read(fd, buf, sizeof buf)) {
		if (cc < 0)
			errexit("echo read: %s\n", strerror(errno));
		if (write(fd, buf, cc) < 0)
			errexit("echo write: %s\n", strerror(errno));
		(void) pthread_mutex_lock(&stats.st_mutex);
		stats.st_bytecount += cc;
		(void) pthread_mutex_unlock(&stats.st_mutex);
	}
	(void) close(fd);
	(void) pthread_mutex_lock(&stats.st_mutex);
	stats.st_contime += time(0) - start;
	stats.st_concount--;
	stats.st_contotal++;
	(void) pthread_mutex_unlock(&stats.st_mutex);
	return 0;
}

/*------------------------------------------------------------------------
 * prstats - print server statistical data
 *------------------------------------------------------------------------
 */
void prstats(void)
{
	time_t	now;

	while (1) {
		(void) sleep(INTERVAL);

		(void) pthread_mutex_lock(&stats.st_mutex);
		now = time(0);
		(void) printf("--- %s", ctime(&now));
		(void) printf("%-32s: %u\n", "Current connections",	stats.st_concount);
		(void) printf("%-32s: %u\n", "Completed connections", stats.st_contotal);
		if (stats.st_contotal) {
			(void) printf("%-32s: %.2f (secs)\n", "Average complete connection time", (float)stats.st_contime /	(float)stats.st_contotal);
			(void) printf("%-32s: %.2f\n", "Average byte count", (float)stats.st_bytecount / (float)(stats.st_contotal + stats.st_concount));
		}
		(void) printf("%-32s: %lu\n\n", "Total byte count",	stats.st_bytecount);
		(void) pthread_mutex_unlock(&stats.st_mutex);

	}
}

/*---------------------------------------------------------------------------
 * ��������� errexit - ������� ��������� �� ������ � ��������� ������
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
 * ��������� passiveTCP - ������� ��������� ����� ��� �������������
 * � ������� TCP
 *---------------------------------------------------------------------------
 */
int passiveTCP(const char *service, int qlen)
/*
 * ���������:
 * service - ������, ��������� � ��������� ������
 * qlen - ������������ ����� ������� �������� �������
 */
{
return passivesock(service, "tcp", qlen);
}


/*------------------------------------------------------------------------
 * passivesock - allocate & bind a server socket using TCP or UDP
 *------------------------------------------------------------------------
 */
int passivesock(const char *service, const char *transport, int qlen)
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

