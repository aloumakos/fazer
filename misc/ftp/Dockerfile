FROM fauria/vsftpd
EXPOSE 20 21 21100-21110
RUN curl http://vis-www.cs.umass.edu/lfw/lfw.tgz >> lfw.tgz \
    && tar -xvzf lfw.tgz \
    && rm lfw.tgz \
    && mkdir /home/vsftpd/user \
    && mv lfw /home/vsftpd/user \
    && chown -R ftp:ftp /home/vsftpd/user \
    && chmod -R 755 /home/vsftpd/user

